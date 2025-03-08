use aws_config::BehaviorVersion;
use aws_sdk_dynamodb::Client;
use lambda_http::{http::Method, tower::ServiceBuilder, tracing, Error, Request};
mod http_handler;
use http_handler::function_handler;
use tower_http::cors::{Any, CorsLayer};

#[tokio::main]
async fn main() -> Result<(), Error> {
    tracing::init_default_subscriber();

    let cors_layer = CorsLayer::new()
        .allow_methods(vec![Method::PUT])
        .allow_origin(Any);

        let config = aws_config::defaults(BehaviorVersion::latest()).load().await;
        let ddb = Client::new(&config);
        let shared_ddb = &ddb;
        let closure = move |event: Request| async move { function_handler(&shared_ddb, event).await };
        let service_fn = lambda_http::service_fn(closure);
        let handler = ServiceBuilder::new()
            // Add the CORS layer to the service
            .layer(cors_layer)
            .service(service_fn);

    lambda_http::run(handler).await
}
