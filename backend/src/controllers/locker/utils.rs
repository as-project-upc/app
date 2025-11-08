use crate::domain::error::ApiError;
use crate::utils::Claims;
use std::path::PathBuf;
use tokio::fs;

pub fn validate_existing_path(claims: Claims, file_name: &str) -> Result<PathBuf, ApiError> {
    let storage_dir = PathBuf::from("storage").join(&claims.sub);
    let file_path = storage_dir.join(&file_name);

    if !file_name
        .chars()
        .all(|c| c.is_alphanumeric() || c == '.' || c == '_' || c == '-')
    {
        return Err(ApiError::ValidationError {
            field: "file_name".to_string(),
            message: "Invalid file name".to_string(),
        });
    }

    if !file_path.exists() {
        return Err(ApiError::ValidationError {
            field: "file".to_string(),
            message: "File not found".to_string(),
        });
    }

    if !file_path.starts_with(&storage_dir) {
        return Err(ApiError::ValidationError {
            field: "file_name".to_string(),
            message: "Invalid file path".to_string(),
        });
    }

    Ok(file_path)
}

pub async fn validate_non_existing_path(
    claims: Claims,
    file_name: &str,
    i: usize,
) -> Result<PathBuf, ApiError> {
    let storage_dir = PathBuf::from("storage").join(&claims.sub);

    if let Err(_) = fs::create_dir_all(&storage_dir).await {
        return Err(ApiError::InternalError);
    }

    validate_storage_size_limit(&storage_dir, i).await?;

    let file_path = storage_dir.join(&file_name);

    if !file_name
        .chars()
        .all(|c| c.is_alphanumeric() || c == '.' || c == '_' || c == '-')
    {
        return Err(ApiError::ValidationError {
            field: "file_name".to_string(),
            message: "Invalid file name".to_string(),
        });
    }

    if file_path.exists() {
        return Err(ApiError::ValidationError {
            field: "file".to_string(),
            message: "File exists".to_string(),
        });
    }

    if !file_path.starts_with(&storage_dir) {
        return Err(ApiError::ValidationError {
            field: "file_name".to_string(),
            message: "Invalid file path".to_string(),
        });
    }

    Ok(file_path)
}

pub async fn validate_storage_size_limit(
    storage_dir: &PathBuf,
    body_size: usize,
) -> Result<(), ApiError> {
    let mut size = 0u64;
    let mut entries = match fs::read_dir(storage_dir).await {
        Ok(e) => e,
        Err(_) => return Ok(()),
    };

    while let Some(entry) = entries.next_entry().await.unwrap_or(None) {
        let metadata = entry
            .metadata()
            .await
            .map_err(|_| ApiError::InternalError)?;
        if metadata.is_file() {
            size += metadata.len();
        }
    }

    if size + body_size as u64 > 100 * 1024 * 1024 {
        return Err(ApiError::ValidationError {
            field: "file".to_string(),
            message: "Locker size exceeds 100MB limit".to_string(),
        });
    }

    Ok(())
}
