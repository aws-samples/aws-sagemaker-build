TEMPLATES=$(shell for l in $$(ls ./templates | grep -v util | grep -v README.md);do echo templates/$$l;done)

.PHONY: lambda templates upload website test bootstrap assets build

All: assets templates lambda build 

build:
	mkdir -p build; mkdir -p build/lambda; mkdir -p build/templates

lambda:  build
	make -C ./lambda

templates: $(TEMPLATES) build
	for l in $(TEMPLATES); do	\
		$(MAKE) -C $$l;			\
	done;			

check: $(TEMPLATES) build
	for l in $(TEMPLATES); do	\
		$$l/bin/check.js;			\
	done;			

upload: templates lambda website build assets
	./bin/upload.sh
