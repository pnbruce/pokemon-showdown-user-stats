use flate2::read::GzDecoder;
use lambda_http::{Body, Error, Request, RequestExt, Response};
use std::env;
use std::io::Read;

/// This is the main body for the function.
/// Write your code inside it.
/// There are some code example in the following URLs:
/// - https://github.com/awslabs/aws-lambda-rust-runtime/tree/main/examples
pub(crate) async fn function_handler(
    ddb: &aws_sdk_dynamodb::Client,
    event: Request,
) -> Result<Response<Body>, Error> {
    let username = match event
        .path_parameters_ref()
        .and_then(|params| params.first("username"))
    {
        Some(value) => value,
        None => {
            // Return a 400 Bad Request response if username is missing.
            return Ok(Response::builder()
                .status(400)
                .header("content-type", "text/html")
                .body("Key 'username' is missing".into())
                .map_err(Box::new)?);
        }
    };

    let id = to_id(username);

    if id.len() <= 0 && id.len() < 19 {
        return Ok(Response::builder()
            .status(400)
            .header("content-type", "text/html")
            .body("invalid username".into())
            .map_err(Box::new)?);
    }

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
                .status(500)
                .header("content-type", "text/html")
                .body(format!("database error").into())
                .map_err(Box::new)?;
            return Ok(resp);
        }
    };

    let item = match ddb_response.item {
        Some(item) => item,
        None => {
            let resp = Response::builder()
                .status(404)
                .header("content-type", "text/html")
                .body("User Does not exist in the database".into())
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
                .body(format!("Error decompressing Gzipped JSON").into())
                .map_err(Box::new)?;
            return Ok(resp);
        }
    }

    let resp = Response::builder()
        .status(200)
        .header("content-type", "application/json")
        .body(stats_json.into())
        .map_err(Box::new)?;
    Ok(resp)
}

fn to_id<T: AsRef<str>>(text: T) -> String {
    text.as_ref()
        .to_lowercase()
        .chars()
        .filter(|c| c.is_ascii_alphanumeric())
        .collect()
}
