use aws_config::BehaviorVersion;
use aws_sdk_dynamodb as dynamodb;
use flate2::read::GzDecoder;
use flate2::write::GzEncoder;
use flate2::Compression;
use pokemon_showdown_user_stats_model::{Rating, User};
use serde_json::Value;
use std::env;
use std::io::Read;
use std::io::Write;
use std::thread;
use std::time::Duration;
use std::time::Instant;
use std::time::SystemTime;

#[tokio::main]
async fn main() {
    let user_stats_table_env = "USER_STATS_TABLE";
    let config = aws_config::defaults(BehaviorVersion::latest()).load().await;
    let ddb = dynamodb::Client::new(&config);
    let user_stats_table = match env::var(user_stats_table_env) {
        Ok(val) => val,
        Err(_) => {
            println!("ERROR: {} is not set. Exiting...", user_stats_table_env);
            return;
        }
    };

    loop {
        let mut exclusive_start_key = None;
        let scan_start_time = Instant::now();
        loop {
            let scan_page_start_time = Instant::now();
            let user_stats_table_scan_resp = match ddb
                .scan()
                .set_exclusive_start_key(exclusive_start_key.clone())
                .table_name(&user_stats_table)
                .limit(50)
                .send()
                .await
            {
                Ok(resp) => resp,
                Err(e) => {
                    println!("ERROR: error scanning table: {:?}", e);
                    tokio::time::sleep(Duration::from_secs(3600)).await;
                    continue;
                }
            };

            if let Some(items) = user_stats_table_scan_resp.items {
                for item in items {
                    let user_id = match item.get("userId") {
                        Some(val) => val,
                        None => {
                            println!("ERROR: Item {:?} is missing 'userId' key", item);
                            continue;
                        }
                    };
                    let user_id = match user_id.as_s() {
                        Ok(val) => val,
                        Err(_) => {
                            println!("ERROR: Item {:?} 'userId' key is not a string", item);
                            continue;
                        }
                    };

                    println!("Processing user: {}", user_id);
                    let stats_json_gz = match item.get("stats.json.gz") {
                        Some(val) => val,
                        None => {
                            println!("Item {:?} is missing 'stats.json.gz' key", item);
                            continue;
                        }
                    };
                    let stats_json_gz = match stats_json_gz.as_b() {
                        Ok(val) => val,
                        Err(_) => {
                            println!("Item {:?} 'stats.json.gz' key is not a binary", item);
                            continue;
                        }
                    };

                    let mut decoder = GzDecoder::new(stats_json_gz.as_ref());

                    let mut stats_json = String::new();

                    match decoder.read_to_string(&mut stats_json) {
                        Ok(_) => (),
                        Err(e) => {
                            println!("Error decompressing Gzipped JSON: {:?}", e);
                            continue;
                        }
                    }

                    let mut user: User = match serde_json::from_str(&stats_json) {
                        Ok(resp) => resp,
                        Err(e) => {
                            println!("Error parsing JSON: {:?}", e);
                            continue;
                        }
                    };

                    let ps_response = match reqwest::get(format!(
                        "https://pokemonshowdown.com/users/{user_id}.json"
                    ))
                    .await
                    {
                        Ok(resp) => resp,
                        Err(e) => {
                            println!(
                                "Error getting PS user JSON for user ID: {}, err: {}",
                                user_id, e
                            );
                            continue;
                        }
                    };

                    let ps_response_body = match ps_response.text().await {
                        Ok(resp) => resp,
                        Err(_) => {
                            println!("Error getting text from PS user for user ID: {}", user_id);
                            continue;
                        }
                    };

                    let ps_user_stats: Value = match serde_json::from_str(&ps_response_body) {
                        Ok(resp) => resp,
                        Err(_) => {
                            println!("Error parsing PS user JSON for user ID: {}", user_id);
                            continue;
                        }
                    };

                    let current_time =
                        match SystemTime::now().duration_since(SystemTime::UNIX_EPOCH) {
                            Ok(val) => val.as_secs(),
                            Err(e) => {
                                println!("Error getting current time: {:?}", e);
                                continue;
                            }
                        };

                    if let Value::Object(map) = ps_user_stats["ratings"].clone() {
                        for (format, rating) in map {
                            let new_elo = match rating["elo"].as_f64() {
                                Some(resp) => resp,
                                None => {
                                    println!(
                                        "Error parsing PS user JSON elo for user ID: {}",
                                        user_id
                                    );
                                    continue;
                                }
                            };

                            if (new_elo < 1000.0) || (new_elo > 10000.0) {
                                println!(
                                    "Elo out of bounds for user ID: {}, elo: {}",
                                    user_id, new_elo
                                );
                                println!("full ps response: {}", ps_response_body);
                                continue;
                            }

                            let new_rating = Rating {
                                time: current_time,
                                elo: new_elo,
                            };

                            let ratings = user.formats.entry(format).or_insert_with(Vec::new);
                            if ratings.last().map(|r| r.elo) != Some(new_elo) {
                                println!("Pushing new rating");
                                ratings.push(new_rating);
                            }
                        }
                    } else {
                        println!(
                            "Error parsing PS user JSON ratings for user ID: {}",
                            user_id
                        );
                        continue;
                    }
                    let user_string = match serde_json::to_string(&user) {
                        Ok(resp) => resp,
                        Err(e) => {
                            println!("Error serializing user object: {:?}", e);
                            continue;
                        }
                    };

                    let mut encoder = GzEncoder::new(Vec::new(), Compression::default());
                    match encoder.write_all(user_string.as_bytes()) {
                        Ok(_) => {}
                        Err(_) => {
                            println!("Error writing to Gzipped JSON");
                            continue;
                        }
                    }

                    let compressed_bytes = match encoder.finish() {
                        Ok(resp) => resp,
                        Err(_) => {
                            println!("Error finishing Gzipped JSON");
                            continue;
                        }
                    };

                    match ddb
                        .put_item()
                        .item(
                            "userId",
                            aws_sdk_dynamodb::types::AttributeValue::S(user.userid),
                        )
                        .item(
                            "stats.json.gz",
                            aws_sdk_dynamodb::types::AttributeValue::B(
                                compressed_bytes.clone().into(),
                            ),
                        )
                        .table_name(user_stats_table.clone())
                        .send()
                        .await
                    {
                        Ok(_) => {}
                        Err(e) => {
                            println!("Error writing to DDB: {:?}", e);
                            continue;
                        }
                    };
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

            println!("page scan time: {} milis", time_passed.as_millis());
            println!("Scan page once per second; Waiting for {} milis...", wait_time.as_millis());
            tokio::time::sleep(wait_time).await;
        }
        let time_passed = scan_start_time.elapsed();
        let wait_time = if time_passed < Duration::new(60, 0) {
            Duration::new(60, 0) - time_passed
        } else {
            Duration::new(0, 0)
        };
        println!("scan time: {} milis", time_passed.as_millis());
        println!("Scan table once per min. Waiting for {} milis...", wait_time.as_millis());
        tokio::time::sleep(wait_time).await;
    }
}
