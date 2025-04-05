build-and-deploy:
	@echo "Building and deploying to AWS"
	@echo "Building..."
	cd ./add-user-lambda && cargo lambda build --release --features reqwest/native-tls-vendored
	cd ./get-user-lambda && cargo lambda build --release
	cd ./front-end && npm run build
	cd ./infrastructure && cdk synth && cdk deploy --all

watch: hello
	cd ./add-user-lambda && cargo lambda watch

build:
	cd ./add-user-lambda && cargo lambda build --release --features reqwest/native-tls-vendored
