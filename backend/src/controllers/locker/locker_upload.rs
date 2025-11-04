use crate::domain::error::{ApiError, ErrorResponse};
use crate::domain::result::ApiResult;
use crate::utils::Claims;
use axum::{body::Bytes, http::StatusCode, response::Json, Extension};
use serde::{Deserialize, Serialize};
use std::path::PathBuf;
use tokio::fs;
use tokio::io::AsyncWriteExt;

#[derive(Debug, Serialize, Deserialize)]
pub struct UploadResponse {
    pub size: usize,
}

pub async fn upload_handler(
    Extension(claims): Extension<Claims>,
    body: Bytes,
) -> ApiResult<UploadResponse> {
    if body.is_empty() {
        return Err((
            StatusCode::BAD_REQUEST,
            Json(ErrorResponse::new(ApiError::MissingField {
                field: "body".to_string(),
            })),
        ));
    }

    let storage_dir = PathBuf::from("storage").join(&claims.username);
    if let Err(_) = fs::create_dir_all(&storage_dir).await {
        return Err((
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(ErrorResponse::new(ApiError::InternalError)),
        ));
    }

    let file_path = storage_dir.join(&"upload.dat");
    match fs::File::create(&file_path).await {
        Ok(mut file) => {
            if let Err(_) = file.write_all(&body).await {
                return Err((
                    StatusCode::INTERNAL_SERVER_ERROR,
                    Json(ErrorResponse::new(ApiError::InternalError)),
                ));
            }
        }
        Err(_) => {
            return Err((
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(ErrorResponse::new(ApiError::InternalError)),
            ));
        }
    }

    let size = body.len();

    Ok(Json(UploadResponse { size }))
}
