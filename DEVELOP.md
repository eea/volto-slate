# volto-slate

## Develop

Before starting make sure your development environment is properly set. See [Volto Developer Documentation](https://docs.voltocms.com/getting-started/install/)

1.  Make sure you have installed `yo`, `@plone/generator-volto` and `mrs-developer`

        $ npm install -g yo
        $ npm install -g @plone/generator-volto
        $ npm install -g mrs-developer

1.  Create new volto app

        $ yo @plone/volto my-volto-project --addon @eeacms/volto-slate
        $ cd my-volto-project

1.  Add the following to `mrs.developer.json`:

        {
            "volto-slate": {
                "url": "https://github.com/eea/volto-slate.git",
                "package": "@eeacms/volto-slate",
                "branch": "develop",
                "path": "src"
            }
        }

1.  Install

        $ yarn develop
        $ yarn

1.  Start backend

        $ docker run -d --name plone -p 8080:8080 -e SITE=Plone plone

    ...wait for backend to setup and start - `Ready to handle requests`:

        $ docker logs -f plone

    ...you can also check http://localhost:8080/Plone

1.  Start frontend

        $ yarn start

1.  Go to http://localhost:3000

1.  Happy hacking!

        $ cd src/addons/volto-slate/
