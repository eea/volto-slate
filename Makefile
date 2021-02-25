SHELL=/bin/bash

all:
	npm install -g yo
	npm install -g @plone/generator-volto
	npm install -g mrs-developer
	yo @plone/volto project --addon volto-slate:asDefault --workspace src/addons/volto-slate --no-interactive
	ln -sf $$(pwd) project/src/addons/
	cd project && yarn
	@echo "-------------------"
	@echo "Project is ready!"
	@echo "Now run: cd project; yarn start"
