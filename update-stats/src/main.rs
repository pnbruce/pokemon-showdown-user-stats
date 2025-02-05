use aws_config::BehaviorVersion;
use aws_sdk_dynamodb as dynamodb;
use flate2::read::GzDecoder;
use std::env;
use std::io::Read;
use std::thread;
use std::time::Duration;
use std::time::Instant;

#[tokio::main]
async fn main() {
    let user_stats_table_env = "USER_STATS_TABLE";
    let config = aws_config::defaults(BehaviorVersion::latest()).load().await;
    let ddb_client = dynamodb::Client::new(&config);
    let user_stats_table = match env::var(user_stats_table_env) {
        Ok(val) => val,
        Err(_) => {
            println!("{} is not set. Exiting...", user_stats_table_env);
            return;
        }
    };

    loop {
        let scan_start_time = Instant::now();
        let mut exclusive_start_key = None;
        loop {
            let user_stats_table_scan_resp = match ddb_client
                .scan()
                .set_exclusive_start_key(exclusive_start_key.clone())
                .table_name(&user_stats_table)
                .limit(50)
                .send()
                .await
            {
                Ok(resp) => resp,
                Err(e) => {
                    println!("Error scanning table: {:?}", e);
                    thread::sleep(Duration::from_secs(3600));
                    continue;
                }
            };

            let scan_page_start_time = Instant::now();

            if let Some(items) = user_stats_table_scan_resp.items {
                for item in items {
                    let user_id = match item.get("userId") {
                        Some(val) => val,
                        None => {
                            println!("Item {:?} is missing 'userId' key", item);
                            continue;
                        }
                    };
                    let user_id = match user_id.as_s() {
                        Ok(val) => val,
                        Err(_) => {
                            println!("Item {:?} 'userId' key is not a string", item);
                            continue;
                        }
                    };
                    let stats_json_gz = match item.get("Stats.json.gz") {
                        Some(val) => val,
                        None => {
                            println!("Item {:?} is missing 'Stats.json.gz' key", item);
                            continue;
                        }
                    };
                    let stats_json_gz = match stats_json_gz.as_b() {
                        Ok(val) => val,
                        Err(_) => {
                            println!("Item {:?} 'Stats.json.gz' key is not a binary", item);
                            continue;
                        }
                    };

                    let mut decoder = GzDecoder::new(stats_json_gz.as_ref());

                    let mut stats_json = String::new();

                    match decoder.read_to_string(&mut stats_json) {
                        Ok(_) => (),
                        Err(e) => {
                            println!("Error decoding Gzipped JSON: {:?}", e);
                            continue;
                        }
                    }

                    println!("User ID: {}", user_id);
                    println!("Stats JSON: {}", stats_json);
                }
            }

            exclusive_start_key = user_stats_table_scan_resp.last_evaluated_key;

            if exclusive_start_key.is_none() {
                break;
            }

            let time_passed = scan_page_start_time.elapsed();
            let wait_time = if time_passed < Duration::new(1, 0) {
                Duration::new(1, 0) - time_passed
            } else {
                Duration::new(0, 0)
            };
            print!("Wating for {} seconds...", wait_time.as_secs());
            thread::sleep(wait_time);
        }
        let time_passed = scan_start_time.elapsed();
        let wait_time = if time_passed < Duration::new(60, 0) {
            Duration::new(60, 0) - time_passed
        } else {
            Duration::new(0, 0)
        };
        print!("Wating for {} seconds...", wait_time.as_secs());
        thread::sleep(wait_time);
    }
}
