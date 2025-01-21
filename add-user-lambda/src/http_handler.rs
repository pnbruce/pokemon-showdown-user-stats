use aws_config::BehaviorVersion;
use flate2::write::GzEncoder;
use flate2::Compression;
use lambda_http::{Body, Request, Response};
use serde_json::Value;
use std::env;
use std::io::Write;
use std::time::SystemTime;

#[derive(Debug, serde::Deserialize, serde::Serialize)]
struct Rating {
    time: u64,
    elo: f64,
}

#[derive(Debug, serde::Deserialize, serde::Serialize)]
struct Format {
    name: String,
    ratings: Vec<Rating>,
}

#[derive(Debug, serde::Deserialize, serde::Serialize)]
struct User {
    username: String,
    userid: String,
    formats: Vec<Format>,
}

fn get_current_timestamp() -> u64 {
    SystemTime::now()
        .duration_since(SystemTime::UNIX_EPOCH)
        .expect("Time error")
        .as_secs()
}

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
pub(crate) async fn function_handler(event: Request) -> Result<Response<Body>, lambda_http::Error> {
    // Extract request details
    let body = match extract_body(event) {
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

    // Parse the body as JSON
    let parsed_json: Value = serde_json::from_str(&body).expect("Failed to parse JSON body");

    // Validate the "id" key exists
    if let Some(username) = parsed_json.get("username") {
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
        .bucket(user_stats_bucket.clone())
        .key(id.clone() + ".json.gz")
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
    let response = match reqwest::get(format!("https://pokemonshowdown.com/users/{id}.json")).await
    {
        Ok(resp) => resp,
        Err(_) => {
            let resp = Response::builder()
                .status(400)
                .header("content-type", "text/html")
                .body(format!("username: {username}, id: {id} does not exist on PS").into())
                .map_err(Box::new)?;
            return Ok(resp);
        }
    };
    let body = match response.text().await {
        Ok(resp) => resp,
        Err(_) => {
            let resp = Response::builder()
                .status(400)
                .header("content-type", "text/html")
                .body(format!("Error parsing pokemonshowdown response").into())
                .map_err(Box::new)?;
            return Ok(resp);
        }
    };
    // convert SP response into format stored in S3 for tracking stats

    let user_stats: serde_json::Value = match serde_json::from_str(&body) {
        Ok(resp) => resp,
        Err(_) => {
            let resp = Response::builder()
                .status(400)
                .header("content-type", "text/html")
                .body(format!("Error parsing pokemonshowdown response").into())
                .map_err(Box::new)?;
            return Ok(resp);
        }
    };

    let mut user = User {
        username: match user_stats["username"].as_str() {
            Some(resp) => resp.to_string(),
            None => {
                let resp = Response::builder()
                    .status(400)
                    .header("content-type", "text/html")
                    .body(format!("Error parsing pokemonshowdown response username").into())
                    .map_err(Box::new)?;
                return Ok(resp);
            }
        },
        userid: match user_stats["userid"].as_str() {
            Some(resp) => resp.to_string(),
            None => {
                let resp = Response::builder()
                    .status(400)
                    .header("content-type", "text/html")
                    .body(format!("Error parsing pokemonshowdown response userid").into())
                    .map_err(Box::new)?;
                return Ok(resp);
            }
        },
        formats: vec![],
    };

    let current_time = get_current_timestamp();

    if let Value::Object(map) = user_stats["ratings"].clone() {
        for (key, value) in map {
            let mut format = Format {
                name: key,
                ratings: vec![],
            };

            format.ratings.push(Rating {
                time: current_time,
                elo: match value["elo"].as_f64() {
                    Some(resp) => resp,
                    None => {
                        let resp = Response::builder()
                            .status(400)
                            .header("content-type", "text/html")
                            .body(format!("Error parsing pokemonshowdown response elo").into())
                            .map_err(Box::new)?;
                        return Ok(resp);
                    }
                },
            });

            user.formats.push(format);
        }
    } else {
        let resp = Response::builder()
            .status(400)
            .header("content-type", "text/html")
            .body(format!("Error parsing pokemonshowdown response").into())
            .map_err(Box::new)?;
        return Ok(resp);
    }

    // compress json.

    let user_string = match serde_json::to_string(&user) {
        Ok(resp) => resp,
        Err(_) => {
            let resp = Response::builder()
                .status(400)
                .header("content-type", "text/html")
                .body(format!("Error parsing pokemonshowdown response").into())
                .map_err(Box::new)?;
            return Ok(resp);
        }
    };

    let mut encoder = GzEncoder::new(Vec::new(), Compression::default());
    encoder.write_all(user_string.as_bytes()).unwrap();
    let compressed_bytes = encoder.finish().unwrap();

    // write compressioned json to the S3 bucket with the

    match s3
        .put_object()
        .bucket(user_stats_bucket.clone())
        .key(id.clone() + ".json.gz")
        .body(aws_sdk_s3::primitives::ByteStream::from(compressed_bytes))
        .send()
        .await
    {
        Ok(_) => {}
        Err(_) => {
            let resp = Response::builder()
                .status(400)
                .header("content-type", "text/html")
                .body(format!("Error adding new user to datastore").into())
                .map_err(Box::new)?;
            return Ok(resp);
        }
    }

    let resp = Response::builder()
        .status(200)
        .header("content-type", "text/html")
        .body(format!("username: {username}, id: {id}, User: {user_string}").into())
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
