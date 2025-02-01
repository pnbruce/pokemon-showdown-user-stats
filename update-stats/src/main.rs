use std::env;
use std::thread;
use std::time::Duration;

fn main() {
    let user_stats_table = env::var("USER_STATS_TABLE").expect("USER_STATS_TABLE must be set");
    loop {
        println!("user stats table: {user_stats_table}!");
        thread::sleep(Duration::from_secs(3600));
    }
}