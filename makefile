build-and-deploy:
	@echo "Building and deploying to AWS"
	@echo "Building..."
	cd ./add-user-lambda && cargo lambda build --release
	@echo "Deploying..."
	cd ./infrastructure && cdk synth && cdk deploy

watch: 
	cd ./add-user-lambda && cargo lambda watch