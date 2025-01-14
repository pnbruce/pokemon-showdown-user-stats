use lambda_http::{Body, Error, Request, Response};
use serde_json::Value;

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

/// This is the main body for the function.
/// Write your code inside it.
/// There are some code example in the following URLs:
/// - https://github.com/awslabs/aws-lambda-rust-runtime/tree/main/examples
pub(crate) async fn function_handler(event: Request) -> Result<Response<Body>, Error> {
    
    
    // Extract request details
    let body = extract_body(event)
    .map_err(|_|"Failed to extract body from request")
    .unwrap();
    
    // Parse the body as JSON
    let parsed_json: Value = serde_json::from_str(&body)
        .map_err(|_| "Failed to parse body as JSON")?;

    // Validate the "id" key exists
    if let Some(username) = parsed_json.get("username") {
        if !username.is_string() {
            return Err("Key 'username' is not a string".into());
        }
    } else {
        return Err("Key 'username' is missing".into());
    }

    // Validate username
    let username = parsed_json["username"].as_str().unwrap();
    let id = to_id(username);

    // check if S3 contains an entry for this username

    // handle error response form S3 by responsing with internal error

    // if S3 contains an entry for this username, return "user stats already tracked error"

    // check if is on PS

    // handle error response from SP, return "Invalid Pokemon Showdown response error"

    // if user is not on PS then return "user does not exist on SP error"

    // convert SP response into format stored in S3 for tracking stats

    // compress json. 

    // write compressioned json to the S3 bucket with the 

    let resp = Response::builder()
        .status(200)
        .header("content-type", "text/html")
        .body(format!("username: {username}, id: {id}").into())
        .map_err(Box::new)?;
    Ok(resp)
}



#[cfg(test)]
mod tests {
    use super::*;
    use std::collections::HashMap;
    use lambda_http::{Request, RequestExt};

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

    #[tokio::test]
    async fn test_http_handler_with_query_string() {
        let mut query_string_parameters: HashMap<String, String> = HashMap::new();
        query_string_parameters.insert("name".into(), "add-user-lambda".into());

        let request = Request::default()
            .with_query_string_parameters(query_string_parameters);

        let response = function_handler(request).await.unwrap();
        assert_eq!(response.status(), 200);

        let body_bytes = response.body().to_vec();
        let body_string = String::from_utf8(body_bytes).unwrap();

        assert_eq!(
            body_string,
            "Hello add-user-lambda, this is an AWS Lambda HTTP request"
        );
    }
}
