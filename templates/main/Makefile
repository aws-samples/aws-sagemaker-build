.PHONY: all
all:../../../../build/notebooks.zip
	./bin/check.js 
	
../../../../build/notebooks.zip:SageMakerNotebook/notebooks/*/*
	rm build/notebooks.zip ; cd SageMakerNotebook/notebooks && zip -r ../../../../build/notebooks.zip .


