#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::sync::Arc;
use std::time::Duration;
use tokio::sync::RwLock;

#[derive(Clone, Debug, Serialize, Deserialize)]
struct AssetConfig {
    id: String,
    coingecko_id: String,
    api_provider: String,
}

// Hardcoded assets to match src/lib/config/assets.ts
// In a real app, this might be loaded from a config file
fn get_tracked_assets() -> Vec<AssetConfig> {
    vec![
        AssetConfig {
            id: "bitcoin".to_string(),
            coingecko_id: "bitcoin".to_string(),
            api_provider: "coingecko".to_string(),
        },
        AssetConfig {
            id: "ethereum".to_string(),
            coingecko_id: "ethereum".to_string(),
            api_provider: "coingecko".to_string(),
        },
        AssetConfig {
            id: "gold".to_string(),
            coingecko_id: "tether-gold".to_string(),
            api_provider: "coingecko".to_string(),
        },
    ]
}

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
struct HistoryPoint {
    timestamp: i64,
    value: f64,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
struct AssetData {
    current_price: f64,
    change_24h: f64,
    history: Vec<HistoryPoint>,
}

struct AppState {
    cache: Arc<RwLock<HashMap<String, AssetData>>>,
}

#[tauri::command]
async fn get_asset_data(
    state: tauri::State<'_, AppState>,
    id: String,
) -> Result<Option<AssetData>, String> {
    let cache = state.cache.read().await;
    Ok(cache.get(&id).cloned())
}

async fn fetch_asset_data(
    client: &reqwest::Client,
    asset: &AssetConfig,
) -> Result<AssetData, Box<dyn std::error::Error + Send + Sync>> {
    let _headers = reqwest::header::HeaderMap::new();
    // Add User-Agent if needed, reqwest adds one by default but we can customize

    // 1. Fetch Price
    let price_url = format!(
        "https://api.coingecko.com/api/v3/simple/price?ids={}&vs_currencies=usd&include_24hr_change=true",
        asset.coingecko_id
    );

    let price_res = client.get(&price_url).send().await?;
    if !price_res.status().is_success() {
        return Err(format!("Price API error: {}", price_res.status()).into());
    }
    let price_json: serde_json::Value = price_res.json().await?;

    let data = price_json
        .get(&asset.coingecko_id)
        .ok_or("Price data missing")?;
    let current_price = data
        .get("usd")
        .and_then(|v| v.as_f64())
        .ok_or("Missing usd price")?;
    let change_24h = data
        .get("usd_24h_change")
        .and_then(|v| v.as_f64())
        .unwrap_or(0.0);

    // Wait 2s
    tokio::time::sleep(Duration::from_secs(2)).await;

    // 2. Fetch History
    let history_url = format!(
        "https://api.coingecko.com/api/v3/coins/{}/market_chart?vs_currency=usd&days=1",
        asset.coingecko_id
    );

    let history_res = client.get(&history_url).send().await?;
    if !history_res.status().is_success() {
        return Err(format!("History API error: {}", history_res.status()).into());
    }
    let history_json: serde_json::Value = history_res.json().await?;

    let prices = history_json
        .get("prices")
        .and_then(|v| v.as_array())
        .ok_or("Missing history prices")?;

    let history: Vec<HistoryPoint> = prices
        .iter()
        .filter_map(|p| {
            let arr = p.as_array()?;
            if arr.len() >= 2 {
                Some(HistoryPoint {
                    timestamp: arr[0].as_i64()?,
                    value: arr[1].as_f64()?,
                })
            } else {
                None
            }
        })
        .collect();

    Ok(AssetData {
        current_price,
        change_24h,
        history,
    })
}

async fn run_polling_loop(cache: Arc<RwLock<HashMap<String, AssetData>>>) {
    let client = reqwest::Client::new();
    let assets = get_tracked_assets();

    println!("Starting background price update...");

    loop {
        let mut hit_rate_limit = false;

        for asset in &assets {
            match fetch_asset_data(&client, asset).await {
                Ok(data) => {
                    let mut w = cache.write().await;
                    w.insert(asset.id.clone(), data);
                    println!("Updated cache for {}", asset.id);
                }
                Err(e) => {
                    let err_str = e.to_string();
                    if err_str.contains("429") {
                        println!("Rate limit hit for {}. Backing off...", asset.id);
                        hit_rate_limit = true;
                        break;
                    }
                    println!("Failed to update {}: {}", asset.id, e);
                }
            }

            if !hit_rate_limit {
                tokio::time::sleep(Duration::from_secs(4)).await;
            }
        }

        let delay = if hit_rate_limit { 120 } else { 60 };
        println!("Update complete. Next update in {}s.", delay);
        tokio::time::sleep(Duration::from_secs(delay)).await;
    }
}

fn main() {
    let cache = Arc::new(RwLock::new(HashMap::new()));
    let cache_clone = cache.clone();

    tauri::Builder::default()
        .manage(AppState { cache })
        .setup(move |_app| {
            tauri::async_runtime::spawn(async move {
                run_polling_loop(cache_clone).await;
            });
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![get_asset_data])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
