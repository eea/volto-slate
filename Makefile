SHELL=/bin/bash

all:
	npm install -g yo
	npm install -g @plone/generator-volto
	npm install -g mrs-developer
	yo @plone/volto project --addon volto-slate:asDefault --workspace src/addons/volto-slate --no-interactive
	ln -s $(pwd) project/src/addons/
