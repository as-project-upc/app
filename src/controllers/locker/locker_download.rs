use crate::controllers::locker::utils::validate_existing_path;
use crate::domain::error::ApiError;
use crate::utils::Claims;
use axum::{
    body::Bytes,
    response::{IntoResponse, Response},
    Extension,
};
use tokio::fs;

pub async fn download_handler(
    Extension(claims): Extension<Claims>,
    axum::extract::Path(file_name): axum::extract::Path<String>,
) -> Result<Response, ApiError> {
    let file_path = validate_existing_path(claims, &file_name)?;

    match fs::read(&file_path).await {
        Ok(data) => {
            let bytes = Bytes::from(data);
            Ok(([("Content-Type", "application/octet-stream")], bytes).into_response())
        }
        Err(_) => Err(ApiError::InternalError),
    }
}
