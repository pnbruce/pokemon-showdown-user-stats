// use aws_config::BehaviorVersion;
// use aws_sdk_dynamodb as dynamodb;
// use std::time::Duration;
// use tokio::time::sleep;
use std::env;
use std::thread;
use std::time::Duration;

fn main() {
    // let config = aws_config::defaults(BehaviorVersion::latest()).load().await;
    // let ddb = dynamodb::Client::new(&config);
    let user_stats_table_env_var = "USER_STATS_TABLE";
    let user_stats_table = match env::var(user_stats_table_env_var) {
        Ok(table) => table,
        Err(_) => {
            print!("Failed to get {user_stats_table_env_var} from environment");
            return;
        }
    };
    loop {
        println!("table name: {user_stats_table}");
        thread::sleep(Duration::from_secs(3600));
    }
}