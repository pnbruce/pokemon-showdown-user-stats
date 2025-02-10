build-and-deploy:
	@echo "Building and deploying to AWS"
	@echo "Building..."
	cd ./add-user-lambda && cargo lambda build --release --features reqwest/native-tls-vendored
	cd ./get-user-lambda && cargo lambda build --release
	# aws ecr get-login-password --region us-west-2 | docker login --username AWS --password-stdin 147997160234.dkr.ecr.us-west-2.amazonaws.com
	cd ./infrastructure && cdk synth && cdk deploy

watch: 
	cd ./add-user-lambda && cargo lambda watch

build:
	cd ./add-user-lambda && cargo lambda build --release --features reqwest/native-tls-vendored
