use lambda_http::{http::Method, service_fn, tower::ServiceBuilder, tracing, Error};
mod http_handler;
use http_handler::function_handler;
use tower_http::cors::{Any, CorsLayer};


#[tokio::main]
async fn main() -> Result<(), Error> {
    tracing::init_default_subscriber();

        // Define a layer to inject CORS headers
    let cors_layer = CorsLayer::new()
        .allow_methods(vec![Method::GET, Method::POST])
        .allow_origin(Any);

    let handler = ServiceBuilder::new()
        // Add the CORS layer to the service
        .layer(cors_layer)
        .service(service_fn(function_handler));

    lambda_http::run(handler).await
}
