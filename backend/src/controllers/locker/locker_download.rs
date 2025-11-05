use crate::domain::error::ApiError;
use crate::utils::Claims;
use axum::{
    body::Bytes,
    response::{IntoResponse, Response},
    Extension,
};
use std::path::PathBuf;
use tokio::fs;

pub async fn download_handler(Extension(claims): Extension<Claims>) -> Result<Response, ApiError> {
    let storage_dir = PathBuf::from("storage").join(&claims.username);
    let file_path = storage_dir.join("upload.dat");

    if !file_path.exists() {
        return Err(ApiError::ValidationError {
            field: "file".to_string(),
            message: "No file found".to_string(),
        });
    }

    match fs::read(&file_path).await {
        Ok(data) => {
            let bytes = Bytes::from(data);
            Ok(([("Content-Type", "application/octet-stream")], bytes).into_response())
        }
        Err(_) => Err(ApiError::InternalError),
    }
}
