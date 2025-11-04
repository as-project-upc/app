use crate::domain::error::{ApiError, ErrorResponse};
use crate::utils::Claims;
use axum::{
    body::Bytes,
    http::StatusCode,
    response::{IntoResponse, Response},
    Extension,
};
use std::path::PathBuf;
use tokio::fs;

pub async fn download_handler(
    Extension(claims): Extension<Claims>,
) -> Result<Response, (StatusCode, axum::Json<ErrorResponse>)> {
    let storage_dir = PathBuf::from("storage").join(&claims.username);
    let file_path = storage_dir.join("upload.dat");

    if !file_path.exists() {
        return Err((
            StatusCode::NOT_FOUND,
            axum::Json(ErrorResponse::new(ApiError::ValidationError {
                field: "file".to_string(),
                message: "No file found".to_string(),
            })),
        ));
    }

    match fs::read(&file_path).await {
        Ok(data) => {
            let bytes = Bytes::from(data);
            Ok((
                StatusCode::OK,
                [("Content-Type", "application/octet-stream")],
                bytes,
            )
                .into_response())
        }
        Err(_) => Err((
            StatusCode::INTERNAL_SERVER_ERROR,
            axum::Json(ErrorResponse::new(ApiError::InternalError)),
        )),
    }
}
