use crate::domain::error::ApiError;
use crate::domain::result::ApiResult;
use crate::utils::Claims;
use axum::{Extension, Json};
use serde::Serialize;
use std::path::PathBuf;
use tokio::fs;

#[derive(Serialize)]
pub struct FileInfo {
    pub name: String,
    pub size: u64,
}

#[derive(Serialize)]
pub struct ListResponse {
    pub files: Vec<FileInfo>,
}

pub async fn list_handler(Extension(claims): Extension<Claims>) -> ApiResult<ListResponse> {
    let storage_dir = PathBuf::from("storage").join(&claims.sub);

    if !storage_dir.exists() {
        fs::create_dir_all(&storage_dir)
            .await
            .map_err(|_| ApiError::InternalError)?;
        return Ok(Json(ListResponse { files: vec![] }));
    }

    let mut files = Vec::new();
    let mut entries = fs::read_dir(&storage_dir)
        .await
        .map_err(|_| ApiError::InternalError)?;

    while let Some(entry) = entries
        .next_entry()
        .await
        .map_err(|_| ApiError::InternalError)?
    {
        if let Ok(metadata) = entry.metadata().await {
            if metadata.is_file() {
                if let Some(name) = entry.file_name().to_str() {
                    files.push(FileInfo {
                        name: name.to_string(),
                        size: metadata.len(),
                    });
                }
            }
        }
    }

    Ok(Json(ListResponse { files }))
}
