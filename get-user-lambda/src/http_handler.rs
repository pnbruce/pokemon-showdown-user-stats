use aws_config::BehaviorVersion;
use flate2::read::GzDecoder;
use lambda_http::{Body, Error, Request, Response};
use serde_json::Value;
use std::env;
use std::io::Read;

/// This is the main body for the function.
/// Write your code inside it.
/// There are some code example in the following URLs:
/// - https://github.com/awslabs/aws-lambda-rust-runtime/tree/main/examples
pub(crate) async fn function_handler(event: Request) -> Result<Response<Body>, Error> {
    // Extract some useful information from the request
    let event_body = match extract_body(event) {
        Ok(resp) => resp,
        Err(_) => {
            let resp = Response::builder()
                .status(400)
                .header("content-type", "text/html")
                .body("Failed to extract body from user request".into())
                .map_err(Box::new)?;
            return Ok(resp);
        }
    };

    let event_body_value: Value = match serde_json::from_str(&event_body) {
        Ok(resp) => resp,
        Err(_) => {
            let resp = Response::builder()
                .status(400)
                .header("content-type", "text/html")
                .body("Failed to parse JSON body of user request".into())
                .map_err(Box::new)?;
            return Ok(resp);
        }
    };

    if let Some(username) = event_body_value.get("username") {
        if !username.is_string() {
            let resp = Response::builder()
                .status(400)
                .header("content-type", "text/html")
                .body("Key 'username' is not a string".into())
                .map_err(Box::new)?;
            return Ok(resp);
        }
    } else {
        let resp = Response::builder()
            .status(400)
            .header("content-type", "text/html")
            .body("Key 'username' is missing".into())
            .map_err(Box::new)?;
        return Ok(resp);
    }

    let username = match event_body_value["username"].as_str() {
        Some(resp) => resp,
        None => {
            let resp = Response::builder()
                .status(400)
                .header("content-type", "text/html")
                .body("Failed to parse JSON body of user request".into())
                .map_err(Box::new)?;
            return Ok(resp);
        }
    };

    let id = to_id(username);

    let config = aws_config::defaults(BehaviorVersion::latest()).load().await;

    let ddb = aws_sdk_dynamodb::Client::new(&config);

    let user_stats_table = match env::var("USER_STATS_TABLE") {
        Ok(table) => table,
        Err(_) => {
            let resp = Response::builder()
                .status(500)
                .header("content-type", "text/html")
                .body("Failed to get USER_STATS_TABLE from environment".into())
                .map_err(Box::new)?;
            return Ok(resp);
        }
    };

    let ddb_response = match ddb
        .get_item()
        .table_name(user_stats_table.clone())
        .key(
            "userId",
            aws_sdk_dynamodb::types::AttributeValue::S(id.clone()),
        )
        .send()
        .await
    {
        Ok(resp) => resp,
        Err(_) => {
            let resp = Response::builder()
                .status(200)
                .header("content-type", "text/html")
                .body("User does not exist, please add it".into())
                .map_err(Box::new)?;
            return Ok(resp);
        }
    };

    let item = match ddb_response.item {
        Some(item) => item,
        None => {
            let resp = Response::builder()
                .status(500)
                .header("content-type", "text/html")
                .body("error getting user from database".into())
                .map_err(Box::new)?;
            return Ok(resp);
        }
    };

    let stats_json_gz = match item.get("stats.json.gz") {
        Some(val) => val,
        None => {
            let resp = Response::builder()
                .status(500)
                .header("content-type", "text/html")
                .body("User found but no data".into())
                .map_err(Box::new)?;
            return Ok(resp);
        }
    };

    let stats_json_gz = match stats_json_gz.as_b() {
        Ok(val) => val,
        Err(_) => {
            let resp = Response::builder()
                .status(500)
                .header("content-type", "text/html")
                .body("User found by data in unreadable format".into())
                .map_err(Box::new)?;
            return Ok(resp);
        }
    };

    let mut decoder = GzDecoder::new(stats_json_gz.as_ref());

    let mut stats_json = String::new();

    match decoder.read_to_string(&mut stats_json) {
        Ok(_) => (),
        Err(_) => {
            let resp = Response::builder()
                .status(500)
                .header("content-type", "text/html")
                .body(format!("Error decompressing Gzipped JSON").into())
                .map_err(Box::new)?;
            return Ok(resp);
        }
    }

    // Return something that implements IntoResponse.
    // It will be serialized to the right response event automatically by the runtime
    let resp = Response::builder()
        .status(200)
        .header("content-type", "text/html")
        .body(stats_json.into())
        .map_err(Box::new)?;
    Ok(resp)
}

fn extract_body(event: Request) -> Result<std::string::String, &'static str> {
    match event.body() {
        Body::Text(text) => return Result::Ok(text.clone()),
        Body::Binary(_) => return Result::Err("Request body is binary"),
        Body::Empty => return Result::Err("Request body is empty"),
    };
}

fn to_id<T: AsRef<str>>(text: T) -> String {
    // Ensure the input is a string, convert it to lowercase, and remove non-alphanumeric characters
    text.as_ref()
        .to_lowercase()
        .chars()
        .filter(|c| c.is_ascii_alphanumeric())
        .collect()
}