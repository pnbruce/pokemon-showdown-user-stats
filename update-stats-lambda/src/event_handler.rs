use lambda_runtime::{tracing, Error, LambdaEvent};
use aws_lambda_events::event::eventbridge::EventBridgeEvent;

/// This is the main body for the function.
/// Write your code inside it.
/// There are some code example in the following URLs:
/// - https://github.com/awslabs/aws-lambda-rust-runtime/tree/main/examples
/// - https://github.com/aws-samples/serverless-rust-demo/
pub(crate)async fn function_handler(event: LambdaEvent<EventBridgeEvent>) -> Result<(), Error> {
    // Extract some useful information from the request
    let payload: EventBridgeEvent = event.payload;
    tracing::info!("Payload: {:?}", payload);

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
