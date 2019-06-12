NAME=$(shell basename $(shell pwd))
DST=../../build/lambda/$(NAME).zip
$(DST): nodejs/lib/*
	echo "Building $(NAME)"; cd nodejs && npm install && cp -r lib/* node_modules && cd .. && zip -r -q $(DST) .
