pipeline {
  agent {
            node { label "docker-host" }
  }
  environment {
            GIT_NAME = "volto-slate"
            SONARQUBE_TAGS = "www.eionet.europa.eu,forest.eea.europa.eu"
            PATH = "${tool 'NodeJS12'}/bin:${tool 'SonarQubeScanner'}/bin:$PATH"
   }
  stages{         
               stage("Installation for Testing") {
                   steps {
                       script{
                         checkout scm                         
                         tool 'NodeJS12'
                         tool 'SonarQubeScanner'
                         sh "yarn install"  
                       }
                   }
               }
               stage("Code Quality") {
                   steps {
                         catchError(buildResult: 'SUCCESS', stageResult: 'UNSTABLE') {
                           sh "yarn run prettier"
                         }
                         catchError(buildResult: 'SUCCESS', stageResult: 'UNSTABLE') {
                           sh "yarn run lint"
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
                        script {
                          if ( env.CHANGE_BRANCH != "develop" &&  !( env.CHANGE_BRANCH.startsWith("hotfix")) ) {
                              error "Pipeline aborted due to PR not made from develop or hotfix branch"
                          }
                        }
                    }
                  }

               stage("Sonarqube") {
                     // Exclude Pull-Requests
                    when {
                      allOf {
                        environment name: 'CHANGE_ID', value: ''
                      }
                    }
                   steps {
                       withSonarQubeEnv('Sonarqube') {
                               sh '''sonar-scanner -Dsonar.sources=./src -Dsonar.projectKey=$GIT_NAME-$BRANCH_NAME -Dsonar.projectVersion=$BRANCH_NAME-$BUILD_NUMBER'''
                               sh '''try=2; while [ \$try -gt 0 ]; do curl -s -XPOST -u "${SONAR_AUTH_TOKEN}:" "${SONAR_HOST_URL}api/project_tags/set?project=${GIT_NAME}-${BRANCH_NAME}&tags=${SONARQUBE_TAGS},${BRANCH_NAME}" > set_tags_result; if [ \$(grep -ic error set_tags_result ) -eq 0 ]; then try=0; else cat set_tags_result; echo "... Will retry"; sleep 60; try=\$(( \$try - 1 )); fi; done'''
                            
                       }
                   }
               }    
  }
  post {
    always {
      sh '''yarn cache clean'''
      cleanWs(cleanWhenAborted: true, cleanWhenFailure: true, cleanWhenNotBuilt: true, cleanWhenSuccess: true, cleanWhenUnstable: true, deleteDirs: true)

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
        
        def recipients = emailextrecipients([ [$class: 'DevelopersRecipientProvider'], [$class: 'CulpritsRecipientProvider']])
        
        echo "Recipients is ${recipients}"        
        
         emailext(
        subject: '$DEFAULT_SUBJECT',
        body: details,
        attachLog: true,
        compressLog: true,
        recipientProviders: [[$class: 'DevelopersRecipientProvider'], [$class: 'CulpritsRecipientProvider']]
          )
        
      }
    }
  }
}

