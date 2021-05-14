pipeline {
  agent any

  environment {
        GIT_NAME = "volto-slate"
        NAMESPACE = ""
        DEPENDENCIES = "volto-slate:asDefault"
        SONARQUBE_TAGS = "volto.eea.europa.eu"
    }

  stages {

    stage('Code') {
      steps {
        parallel(

          "ES lint": {
            node(label: 'docker') {
              sh '''docker run -i --rm --name="$BUILD_TAG-eslint" -e NAMESPACE="$NAMESPACE" -e GIT_NAME=$GIT_NAME -e GIT_BRANCH="$BRANCH_NAME" -e GIT_CHANGE_ID="$CHANGE_ID" plone/volto-addon-ci eslint'''
            }
          },

          "Style lint": {
            node(label: 'docker') {
              sh '''docker run -i --rm --name="$BUILD_TAG-stylelint" -e NAMESPACE="$NAMESPACE" -e GIT_NAME=$GIT_NAME -e GIT_BRANCH="$BRANCH_NAME" -e GIT_CHANGE_ID="$CHANGE_ID" plone/volto-addon-ci stylelint'''
            }
          },

          "Prettier": {
            node(label: 'docker') {
              sh '''docker run -i --rm --name="$BUILD_TAG-prettier" -e NAMESPACE="$NAMESPACE" -e GIT_NAME=$GIT_NAME -e GIT_BRANCH="$BRANCH_NAME" -e GIT_CHANGE_ID="$CHANGE_ID" plone/volto-addon-ci prettier'''
            }
          }
        )
      }
    }

    stage('Tests') {
      steps {
        parallel(

          "Volto": {
            node(label: 'docker') {
              script {
                try {
                  sh '''docker pull plone/volto-addon-ci'''
                  sh '''docker run -i --name="$BUILD_TAG-volto" -e NAMESPACE="$NAMESPACE" -e GIT_NAME=$GIT_NAME -e GIT_BRANCH="$BRANCH_NAME" -e GIT_CHANGE_ID="$CHANGE_ID" plone/volto-addon-ci'''
                  sh '''mkdir -p xunit-reports'''
                  sh '''docker cp $BUILD_TAG-volto:/opt/frontend/my-volto-project/coverage xunit-reports/'''
                  sh '''docker cp $BUILD_TAG-volto:/opt/frontend/my-volto-project/junit.xml xunit-reports/'''
                  sh '''docker cp $BUILD_TAG-volto:/opt/frontend/my-volto-project/unit_tests_log.txt xunit-reports/'''
                  stash name: "xunit-reports", includes: "xunit-reports/**"
                  archiveArtifacts artifacts: 'xunit-reports/unit_tests_log.txt', fingerprint: true
                  archiveArtifacts artifacts: 'xunit-reports/coverage/lcov.info', fingerprint: true
                  publishHTML (target : [
                    allowMissing: false,
                    alwaysLinkToLastBuild: true,
                    keepAll: true,
                    reportDir: 'xunit-reports/coverage/lcov-report',
                    reportFiles: 'index.html',
                    reportName: 'UTCoverage',
                    reportTitles: 'Unit Tests Code Coverage'
                  ])
                } finally {
                  sh '''docker rm -v $BUILD_TAG-volto || true'''
                }
              }
            }
          }
        )
      }
    }

    stage('Integration tests') {
      steps {
        parallel(

          "Cypress": {
            node(label: 'docker') {
              script {
                try {
                  sh '''docker pull plone; docker run -d --name="$BUILD_TAG-plone" -e SITE="Plone" -e PROFILES="profile-plone.restapi:blocks" plone fg'''
                  sh '''docker pull plone/volto-addon-ci; docker run -i --name="$BUILD_TAG-cypress" --link $BUILD_TAG-plone:plone -e NAMESPACE="$NAMESPACE" -e GIT_NAME=$GIT_NAME -e GIT_BRANCH="$BRANCH_NAME" -e GIT_CHANGE_ID="$CHANGE_ID" -e DEPENDENCIES="$DEPENDENCIES" plone/volto-addon-ci cypress'''
                } finally {
                  try {
                    sh '''mkdir -p cypress-reports'''
                    sh '''docker cp $BUILD_TAG-cypress:/opt/frontend/my-volto-project/src/addons/$GIT_NAME/cypress/videos cypress-reports/'''
                    stash name: "cypress-reports", includes: "cypress-reports/**/*"
                    sh '''docker cp $BUILD_TAG-cypress:/opt/frontend/my-volto-project/src/addons/$GIT_NAME/results cypress-results/'''
                    stash name: "cypress-results", includes: "cypress-results/**"
                    archiveArtifacts artifacts: 'cypress-reports/videos/*.mp4', fingerprint: true

                  }
                  finally {
                    sh '''echo $(docker stop $BUILD_TAG-plone)'''
                    sh '''echo $(docker rm -v $BUILD_TAG-plone)'''
                    sh '''echo $(docker rm -v $BUILD_TAG-cypress)'''
                  }
                }
              }
            }
          }

        )
      }
    }

    stage('Report to SonarQube') {
      // Exclude Pull-Requests
      when {
        allOf {
          environment name: 'CHANGE_ID', value: ''
        }
      }
      steps {
        node(label: 'swarm') {
          script{
            checkout scm
            unstash "xunit-reports"
            def scannerHome = tool 'SonarQubeScanner';
            def nodeJS = tool 'NodeJS11';
            withSonarQubeEnv('Sonarqube') {
              sh '''sed -i "s#/opt/frontend/my-volto-project/src/addons/${GIT_NAME}/##g" xunit-reports/coverage/lcov.info'''
              sh "export PATH=$PATH:${scannerHome}/bin:${nodeJS}/bin; sonar-scanner -Dsonar.javascript.lcov.reportPaths=./xunit-reports/coverage/lcov.info -Dsonar.sources=./src -Dsonar.projectKey=$GIT_NAME-$BRANCH_NAME -Dsonar.projectVersion=$BRANCH_NAME-$BUILD_NUMBER"
              sh '''try=2; while [ \$try -gt 0 ]; do curl -s -XPOST -u "${SONAR_AUTH_TOKEN}:" "${SONAR_HOST_URL}api/project_tags/set?project=${GIT_NAME}-${BRANCH_NAME}&tags=${SONARQUBE_TAGS},${BRANCH_NAME}" > set_tags_result; if [ \$(grep -ic error set_tags_result ) -eq 0 ]; then try=0; else cat set_tags_result; echo "... Will retry"; sleep 60; try=\$(( \$try - 1 )); fi; done'''
            }
          }
        }
      }
    }

    stage('Pull Request') {
      when {
        not {
          environment name: 'CHANGE_ID', value: ''
        }
        environment name: 'CHANGE_TARGET', value: 'master'
      }
      steps {
        node(label: 'docker') {
          script {
            if ( env.CHANGE_BRANCH != "develop" &&  !( env.CHANGE_BRANCH.startsWith("hotfix")) ) {
                error "Pipeline aborted due to PR not made from develop or hotfix branch"
            }
           withCredentials([string(credentialsId: 'eea-jenkins-token', variable: 'GITHUB_TOKEN')]) {
            sh '''docker pull eeacms/gitflow'''
            sh '''docker run -i --rm --name="$BUILD_TAG-gitflow-pr" -e GIT_CHANGE_TARGET="$CHANGE_TARGET" -e GIT_CHANGE_BRANCH="$CHANGE_BRANCH" -e GIT_CHANGE_AUTHOR="$CHANGE_AUTHOR" -e GIT_CHANGE_TITLE="$CHANGE_TITLE" -e GIT_TOKEN="$GITHUB_TOKEN" -e GIT_BRANCH="$BRANCH_NAME" -e GIT_CHANGE_ID="$CHANGE_ID" -e GIT_ORG="$GIT_ORG" -e GIT_NAME="$GIT_NAME" eeacms/gitflow'''
           }
          }
        }
      }
    }

    stage('Release') {
      when {
        allOf {
          environment name: 'CHANGE_ID', value: ''
          branch 'master'
        }
      }
      steps {
        node(label: 'docker') {
          withCredentials([string(credentialsId: 'eea-jenkins-token', variable: 'GITHUB_TOKEN'),string(credentialsId: 'eea-jenkins-npm-token', variable: 'NPM_TOKEN')]) {
            sh '''docker pull eeacms/gitflow'''
            sh '''docker run -i --rm --name="$BUILD_TAG-gitflow-master" -e GIT_BRANCH="$BRANCH_NAME" -e GIT_NAME="$GIT_NAME" -e GIT_TOKEN="$GITHUB_TOKEN" -e NPM_TOKEN="$NPM_TOKEN" eeacms/gitflow'''
          }
        }
      }
    }

  }

  post {
    always {
      script{
        try{
          sh '''mkdir -p junit'''
          try {
            unstash "xunit-reports"
            sh '''cp -p xunit-reports/*.xml junit/'''   
            junit 'junit/*.xml'
          }
          catch (Exception e) {
            sh '''echo "No Unit Tests junit results"'''
          }
        
          try {
            unstash "cypress-results"
            sh '''cp -p cypress-results/*.xml junit/''' 
            junit 'junit/*.xml'      
          }
          catch (Exception e) {
            sh '''echo "No cypress junit results"'''
          }
        }
        catch (Exception e) {
          sh '''echo "No junit results"'''
        }
      }
      cleanWs(cleanWhenAborted: true, cleanWhenFailure: true, cleanWhenNotBuilt: true, cleanWhenSuccess: true, cleanWhenUnstable: true, deleteDirs: true)
    }
    changed {
      script {
        def url = "${env.BUILD_URL}/display/redirect"
        def status = currentBuild.currentResult
        def subject = "${status}: Job '${env.JOB_NAME} [${env.BUILD_NUMBER}]'"
        def summary = "${subject} (${url})"
        def details = """<h1>${env.JOB_NAME} - Build #${env.BUILD_NUMBER} - ${status}</h1>
                         <p>Check console output at <a href="${url}">${env.JOB_BASE_NAME} - #${env.BUILD_NUMBER}</a></p>
                      """

        def color = '#FFFF00'
        if (status == 'SUCCESS') {
          color = '#00FF00'
        } else if (status == 'FAILURE') {
          color = '#FF0000'
        }

        emailext (subject: '$DEFAULT_SUBJECT', to: '$DEFAULT_RECIPIENTS', body: details)
      }
    }
  }
}
