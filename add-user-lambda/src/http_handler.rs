use aws_config::BehaviorVersion;
use lambda_http::{Body, Request, Response};
use serde_json::Value;
use std::env;

fn to_id<T: AsRef<str>>(text: T) -> String {
    // Ensure the input is a string, convert it to lowercase, and remove non-alphanumeric characters
    text.as_ref()
        .to_lowercase()
        .chars()
        .filter(|c| c.is_ascii_alphanumeric())
        .collect()
}

fn extract_body(event: Request) -> Result<std::string::String, &'static str> {
    match event.body() {
        Body::Text(text) => return Result::Ok(text.clone()),
        Body::Binary(_) => return Result::Err("Request body is binary".into()),
        Body::Empty => return Result::Err("Request body is empty"),
    };
}

fn stringify(x: &str) -> String {
    format!("Failed to extract body: {x}")
}

/// This is the main body for the function.
/// Write your code inside it.
/// There are some code example in the following URLs:
/// - https://github.com/awslabs/aws-lambda-rust-runtime/tree/main/examples
pub(crate) async fn function_handler(event: Request) -> Result<Response<Body>, lambda_http::Error> {
    // Extract request details
    let body = extract_body(event).map_err(stringify)?;

    // Parse the body as JSON
    let parsed_json: Value = serde_json::from_str(&body).expect("Failed to parse JSON body");

    // Validate the "id" key exists
    if let Some(username) = parsed_json.get("username") {
        if !username.is_string() {
            return Err("Key 'username' is not a string".into());
        }
    } else {
        return Err("Key 'username' is missing".into());
    }

    // Validate username
    let username = parsed_json["username"]
        .as_str()
        .expect("Failed to parse JSON body");
    let id = to_id(username);

    let user_stats_bucket = env::var("USER_STATS_BUCKET").expect("Failed to parse JSON body");

    // check if S3 contains an entry for this username
    let config = aws_config::defaults(BehaviorVersion::latest()).load().await;
    let s3 = aws_sdk_s3::Client::new(&config);

    match s3
        .head_object()
        .bucket(user_stats_bucket)
        .key(id.clone() + ".json")
        .send()
        .await
    {
        Ok(_) => {
            let resp = Response::builder()
                .status(400)
                .header("content-type", "text/html")
                .body(format!("username: {username}, id: {id} has already been added").into())
                .map_err(Box::new)?;
            return Ok(resp);
        }
        Err(_) => {}
    }

    // check if is on PS
    let body = reqwest::get(format!("https://pokemonshowdown.com/users/{id}.json"))
        .await?
        .text()
        .await?;

    // handle error response from SP, return "Invalid Pokemon Showdown response error"

    // if user is not on PS then return "user does not exist on SP error"

    // convert SP response into format stored in S3 for tracking stats

    // compress json.

    // write compressioned json to the S3 bucket with the

    let resp = Response::builder()
        .status(200)
        .header("content-type", "text/html")
        .body(format!("username: {username}, id: {id}, ps resp: {body}").into())
        .map_err(Box::new)?;
    Ok(resp)
}

#[cfg(test)]
mod tests {
    use super::*;
    use lambda_http::{Request, RequestExt};
    use std::collections::HashMap;

    #[tokio::test]
    async fn test_generic_http_handler() {
        let request = Request::default();

        let response = function_handler(request).await.unwrap();
        assert_eq!(response.status(), 200);

        let body_bytes = response.body().to_vec();
        let body_string = String::from_utf8(body_bytes).unwrap();

        assert_eq!(
            body_string,
            "Hello world, this is an AWS Lambda HTTP request"
        );
    }
}
