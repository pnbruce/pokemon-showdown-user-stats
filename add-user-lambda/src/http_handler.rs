use aws_config::BehaviorVersion;
use flate2::write::GzEncoder;
use flate2::Compression;
use lambda_http::{Body, Request, Response};
use pokemon_showdown_user_stats_model::{Rating, User};
use serde_json::Value;
use std::collections::HashMap;
use std::env;
use std::io::Write;
use std::time::SystemTime;

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

    let user_input: Value = match serde_json::from_str(&body) {
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

    if let Some(username) = user_input.get("username") {
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

    let username = match user_input["username"].as_str() {
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
                .status(400)
                .header("content-type", "text/html")
                .body(format!("error calling ddb").into())
                .map_err(Box::new)?;
            return Ok(resp);
        }
    };

    if ddb_response.item.is_some() {
        let resp = Response::builder()
            .status(400)
            .header("content-type", "text/html")
            .body(format!("User has already been added").into())
            .map_err(Box::new)?;
        return Ok(resp);
    }

    // check if is on PS
    let ps_response =
        match reqwest::get(format!("https://pokemonshowdown.com/users/{id}.json")).await {
            Ok(resp) => resp,
            Err(_) => {
                let resp = Response::builder()
                    .status(500)
                    .header("content-type", "text/html")
                    .body(format!("id: {id} Unable to connect to PokemonShowdown").into())
                    .map_err(Box::new)?;
                return Ok(resp);
            }
        };

    if ps_response.status().as_u16() == 404 {
        let resp = Response::builder()
            .status(404)
            .header("content-type", "text/html")
            .body(format!("User not found on Pokemon Showdown").into())
            .map_err(Box::new)?;
        return Ok(resp);
    }

    if ps_response.status().as_u16() != 200 {
        let resp = Response::builder()
            .status(500)
            .header("content-type", "text/html")
            .body(format!("pokemon shodown api replied with status code: {} for user: {username}, id: {id}", 
                ps_response.status()).into())
            .map_err(Box::new)?;
        return Ok(resp);
    }

    let ps_response_body = match ps_response.text().await {
        Ok(resp) => resp,
        Err(_) => {
            let resp = Response::builder()
                .status(500)
                .header("content-type", "text/html")
                .body(format!("Error parsing pokemonshowdown response").into())
                .map_err(Box::new)?;
            return Ok(resp);
        }
    };
    // convert SP response into format stored in S3 for tracking stats

    let user_stats: serde_json::Value = match serde_json::from_str(&ps_response_body) {
        Ok(resp) => resp,
        Err(_) => {
            let resp = Response::builder()
                .status(500)
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
                    .status(500)
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
                    .status(500)
                    .header("content-type", "text/html")
                    .body(format!("Error parsing pokemonshowdown response userid").into())
                    .map_err(Box::new)?;
                return Ok(resp);
            }
        },
        formats: HashMap::new(),
    };

    let current_time = get_current_timestamp();

    if let Some(Value::Object(map)) = user_stats.get("ratings") {
        for (format, rating) in map {
            let elo = match rating.get("elo").and_then(Value::as_f64) {
                Some(val) => val,
                None => {
                    let resp = Response::builder()
                        .status(500)
                        .header("content-type", "text/html")
                        .body("Error parsing pokemonshowdown response elo".into())
                        .map_err(Box::new)?;
                    return Ok(resp);
                }
            };

            let ratings = vec![Rating {
                time: current_time,
                elo,
            }];
            user.formats.insert(format.clone(), ratings);
        }
    } else {
        let resp = Response::builder()
            .status(500)
            .header("content-type", "text/html")
            .body("Error parsing pokemonshowdown response".into())
            .map_err(Box::new)?;
        return Ok(resp);
    }

    let user_string = match serde_json::to_string(&user) {
        Ok(resp) => resp,
        Err(_) => {
            let resp = Response::builder()
                .status(500)
                .header("content-type", "text/html")
                .body(format!("Error parsing pokemonshowdown response").into())
                .map_err(Box::new)?;
            return Ok(resp);
        }
    };

    let mut encoder = GzEncoder::new(Vec::new(), Compression::default());
    match encoder.write_all(user_string.as_bytes()) {
        Ok(_) => {}
        Err(_) => {
            let resp = Response::builder()
                .status(500)
                .header("content-type", "text/html")
                .body(format!("Error compressing json").into())
                .map_err(Box::new)?;
            return Ok(resp);
        }
    };

    let compressed_bytes = match encoder.finish() {
        Ok(resp) => resp,
        Err(_) => {
            let resp = Response::builder()
                .status(500)
                .header("content-type", "text/html")
                .body(format!("Error compressing json").into())
                .map_err(Box::new)?;
            return Ok(resp);
        }
    };

    // write compressioned json to the S3 bucket with the

    match ddb
        .put_item()
        .item(
            "userId",
            aws_sdk_dynamodb::types::AttributeValue::S(id.clone()),
        )
        .item(
            "stats.json.gz",
            aws_sdk_dynamodb::types::AttributeValue::B(compressed_bytes.clone().into()),
        )
        .table_name(user_stats_table.clone())
        .send()
        .await
    {
        Ok(_) => {}
        Err(error) => {
            let resp = Response::builder()
                .status(500)
                .header("content-type", "text/html")
                .body(format!("Error adding new user to datastore: {error}").into())
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
