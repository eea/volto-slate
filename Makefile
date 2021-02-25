SHELL=/bin/bash

DIR=$(shell basename $$(pwd))
ADDON ?= volto-slate:asDefault

all:
	npm install -g yo
	npm install -g @plone/generator-volto
	npm install -g mrs-developer
	yo @plone/volto project --addon ${ADDON} --workspace "src/addons/${DIR}" --no-interactive
	ln -sf $$(pwd) project/src/addons/
	cp .project.eslintrc.js .eslintrc.js
	cd project && yarn
	@echo "-------------------"
	@echo "Project is ready!"
	@echo "Now run: cd project && yarn start"
