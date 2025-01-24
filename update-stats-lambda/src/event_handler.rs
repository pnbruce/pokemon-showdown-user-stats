use aws_config::BehaviorVersion;
use aws_lambda_events::event::eventbridge::EventBridgeEvent;
use flate2::read::GzDecoder;
use lambda_runtime::{tracing, Error, LambdaEvent};
use serde_json::Value;
use std::env;
use std::io::Read;

/// This is the main body for the function.
/// Write your code inside it.
/// There are some code example in the following URLs:
/// - https://github.com/awslabs/aws-lambda-rust-runtime/tree/main/examples
/// - https://github.com/aws-samples/serverless-rust-demo/
pub(crate) async fn function_handler(event: LambdaEvent<EventBridgeEvent>) -> Result<(), Error> {
    // Extract some useful information from the request
    // let payload: EventBridgeEvent = event.payload;
    // tracing::info!("Payload: {:?}", payload);

    // let config = aws_config::defaults(BehaviorVersion::latest()).load().await;
    // let s3 = aws_sdk_s3::Client::new(&config);
    // let user_stats_bucket = match env::var("USER_STATS_BUCKET") {
    //     Ok(bucket) => bucket,
    //     Err(_) => {
    //         tracing::error!("Failed to get USER_STATS_BUCKET from environment");
    //         return Err(Error::from(
    //             "Failed to get USER_STATS_BUCKET from environment",
    //         ));
    //     }
    // };

    // let mut user_stats: Vec<String> = Vec::new();

    // // List all objects in the bucket
    // let mut continuation_token = None;
    // loop {
    //     let resp = match s3
    //         .list_objects_v2()
    //         .bucket(&user_stats_bucket)
    //         .set_continuation_token(continuation_token.clone())
    //         .send()
    //         .await
    //     {
    //         Ok(resp) => resp,
    //         Err(e) => {
    //             tracing::error!("Failed to list objects in bucket: {:?}", e);
    //             return Err(Error::from("Failed to list objects in bucket"));
    //         }
    //     };

    //     resp.contents().iter().for_each(|obj| {
    //         user_stats.push(obj.key().expect("No key").to_string());
    //     });

    //     // Check if there are more objects to fetch
    //     if match resp.is_truncated() {
    //         Some(true) => true,
    //         _ => false,
    //     } {
    //         tracing::info!("Truncated response, more objects to fetch");
    //         continuation_token = match resp.next_continuation_token() {
    //             Some(token) => Some(token.into()),
    //             None => {
    //                 tracing::error!("No continuation token in truncated response");
    //                 return Err(Error::from("No continuation token in truncated response"));
    //             }
    //         };
    //     } else {
    //         break;
    //     }
    // }

    // for user_key in &user_stats {
    //     tracing::info!("Processing user_key: {}", user_key);
    //     let resp = match s3
    //         .get_object()
    //         .bucket(&user_stats_bucket)
    //         .key(user_key)
    //         .send()
    //         .await
    //     {
    //         Ok(resp) => resp,
    //         Err(e) => {
    //             tracing::error!("Failed to get object: {:?}", e);
    //             return Err(Error::from("Failed to get object"));
    //         }
    //     };

    //     let body_bytes = resp.body.collect().await?.into_bytes();

    //     let mut decoder = GzDecoder::new(&body_bytes[..]);
    //     let mut decompressed_data = String::new();
    //     decoder.read_to_string(&mut decompressed_data)?;

    //     tracing::info!("Decompressed data: {}", decompressed_data);

    //     let mut user: User = match serde_json::from_str(&decompressed_data) {
    //         Ok(user) => user,
    //         Err(e) => {
    //             tracing::error!("Failed to parse user data: {:?}", e);
    //             return Err(Error::from("Failed to parse user data"));
    //         }
    //     };

    //     // Get PS data for user
    //     let ps_data = match reqwest::get(format!(
    //         "https://pokemonshowdown.com/users/{}.json",
    //         user.userid
    //     ))
    //     .await
    //     {
    //         Ok(resp) => resp,
    //         Err(e) => {
    //             tracing::error!("Failed to get PS data: {:?}", e);
    //             return Err(Error::from("Failed to get PS data"));
    //         }
    //     };

    //     let ps_body = match ps_data.text().await {
    //         Ok(body) => body,
    //         Err(e) => {
    //             tracing::error!("Failed to get PS body: {:?}", e);
    //             return Err(Error::from("Failed to get PS body"));
    //         }
    //     };

    //     let ps_user: Value = match serde_json::from_str(&ps_body) {
    //         Ok(user) => user,
    //         Err(e) => {
    //             tracing::error!("Failed to parse PS user data: {:?}", e);
    //             return Err(Error::from("Failed to parse PS user data"));
    //         }
    //     };

    //     // Update user data
    //     user.username = match ps_user["username"].as_str() {
    //         Some(username) => username.to_string(),
    //         None => {
    //             tracing::error!("Failed to get username from PS data");
    //             return Err(Error::from("Failed to get username from PS data"));
    //         }
    //     };

    //     user.userid = match ps_user["userid"].as_str() {
    //         Some(userid) => userid.to_string(),
    //         None => {
    //             tracing::error!("Failed to get userid from PS data");
    //             return Err(Error::from("Failed to get userid from PS data"));
    //         }
    //     };

    //     // Update user formats
    //     if let Value::Object(map) = ps_user["ratings"].clone() {
    //         for (key, value) in map {
    //             if user.formats.
    //             let mut format = Format {
    //                 name: key,
    //                 ratings: vec![],
    //             };
    
    //             format.ratings.push(Rating {
    //                 time: current_time,
    //                 elo: match value["elo"].as_f64() {
    //                     Some(resp) => resp,
    //                     None => {
    //                         let resp = Response::builder()
    //                             .status(400)
    //                             .header("content-type", "text/html")
    //                             .body(format!("Error parsing pokemonshowdown response elo").into())
    //                             .map_err(Box::new)?;
    //                         return Ok(resp);
    //                     }
    //                 },
    //             });
    
    //             user.formats.push(format);
    //         }
    //     } else {
    //         let resp = Response::builder()
    //             .status(400)
    //             .header("content-type", "text/html")
    //             .body(format!("Error parsing pokemonshowdown response").into())
    //             .map_err(Box::new)?;
    //         return Ok(resp);
    //     }
    // }

    // list all files in the user stats bucket

    // if error, fail and post error metric to cloudwatch

    // for each file listed:
    // - pull each file from S3 listed in the bucket
    // - decompress,
    // - request PS data for userid
    // - add PS data to file if it has changed otherwise continue with for loop
    // - recompress file
    // - write updated json to S3

    // if any of the above steps fail and post a failure metric and throw an informative error.

    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;
    use lambda_runtime::{Context, LambdaEvent};

    #[tokio::test]
    async fn test_event_handler() {
        let event = LambdaEvent::new(EventBridgeEvent::default(), Context::default());
        let response = function_handler(event).await.unwrap();
        assert_eq!((), response);
    }
}
