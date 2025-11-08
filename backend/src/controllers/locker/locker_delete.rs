use crate::controllers::locker::utils::validate_existing_path;
use crate::domain::error::ApiError;
use crate::domain::result::ApiResult;
use crate::utils::Claims;
use axum::{Extension, Json};
use serde::Serialize;
use tokio::fs;

#[derive(Serialize)]
pub struct DeleteResponse {
    pub message: String,
}

pub async fn delete_handler(
    Extension(claims): Extension<Claims>,
    axum::extract::Path(file_name): axum::extract::Path<String>,
) -> ApiResult<DeleteResponse> {
    let file_path = validate_existing_path(claims, &file_name)?;

    fs::remove_file(&file_path)
        .await
        .map_err(|_| ApiError::InternalError)?;

    Ok(Json(DeleteResponse {
        message: format!("File '{}' deleted", file_name),
    }))
}
