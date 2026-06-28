use serde::Serialize;
use std::fs;
use std::path::PathBuf;
use tauri::Manager;

const OPENROUTER_BASE: &str = "https://openrouter.ai/api/v1";

/// Normalized balance, mirroring the OpenRouter client used elsewhere.
#[derive(Serialize)]
pub struct Balance {
    /// Credits left (USD), or null when the key is unlimited.
    remaining: Option<f64>,
    used: f64,
    total: Option<f64>,
    /// "credits" (account-wide) or "key" (per-key fallback).
    source: String,
}

fn key_path(app: &tauri::AppHandle) -> Result<PathBuf, String> {
    let dir = app.path().app_config_dir().map_err(|e| e.to_string())?;
    fs::create_dir_all(&dir).map_err(|e| e.to_string())?;
    Ok(dir.join("api_key.txt"))
}

#[tauri::command]
fn get_api_key(app: tauri::AppHandle) -> Result<Option<String>, String> {
    let path = key_path(&app)?;
    match fs::read_to_string(&path) {
        Ok(s) => {
            let trimmed = s.trim().to_string();
            Ok(if trimmed.is_empty() { None } else { Some(trimmed) })
        }
        Err(_) => Ok(None),
    }
}

#[tauri::command]
fn set_api_key(app: tauri::AppHandle, key: String) -> Result<(), String> {
    let path = key_path(&app)?;
    fs::write(&path, key.trim()).map_err(|e| e.to_string())
}

#[tauri::command]
fn clear_api_key(app: tauri::AppHandle) -> Result<(), String> {
    let path = key_path(&app)?;
    if path.exists() {
        fs::remove_file(&path).map_err(|e| e.to_string())?;
    }
    Ok(())
}

async fn http_get(path: &str, key: &str) -> Result<serde_json::Value, String> {
    let res = reqwest::Client::new()
        .get(format!("{OPENROUTER_BASE}{path}"))
        .header("Authorization", format!("Bearer {key}"))
        .send()
        .await
        .map_err(|e| format!("network error: {e}"))?;

    let status = res.status();
    if !status.is_success() {
        return Err(format!("HTTP {}", status.as_u16()));
    }
    res.json::<serde_json::Value>()
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
async fn fetch_balance(key: String) -> Result<Balance, String> {
    // Prefer the account-wide /credits endpoint; fall back to /auth/key.
    if let Ok(v) = http_get("/credits", &key).await {
        let total = v["data"]["total_credits"].as_f64().unwrap_or(0.0);
        let used = v["data"]["total_usage"].as_f64().unwrap_or(0.0);
        return Ok(Balance {
            remaining: Some(total - used),
            used,
            total: Some(total),
            source: "credits".into(),
        });
    }

    let v = http_get("/auth/key", &key).await?;
    let used = v["data"]["usage"].as_f64().unwrap_or(0.0);
    let limit = v["data"]["limit"].as_f64();
    Ok(Balance {
        remaining: limit.map(|l| l - used),
        used,
        total: limit,
        source: "key".into(),
    })
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            get_api_key,
            set_api_key,
            clear_api_key,
            fetch_balance
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
