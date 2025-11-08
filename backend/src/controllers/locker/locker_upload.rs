use crate::controllers::locker::utils::validate_non_existing_path;
use crate::domain::error::ApiError;
use crate::domain::result::ApiResult;
use crate::utils::Claims;
use axum::body::Bytes;
use axum::extract::Multipart;
use axum::{response::Json, Extension};
use serde::{Deserialize, Serialize};
use tokio::fs;
use tokio::io::AsyncWriteExt;

#[derive(Debug, Serialize, Deserialize)]
pub struct UploadResponse {
    pub size: usize,
}

pub async fn upload_handler(
    axum::extract::Path(file_name): axum::extract::Path<String>,
    Extension(claims): Extension<Claims>,
    multipart: Multipart,
) -> ApiResult<UploadResponse> {
    let body = validate_multipart(multipart).await?;
    let file_path = validate_non_existing_path(claims, &file_name, body.len()).await?;
    validate_encryption_header(&body)?;

    match fs::File::create(&file_path).await {
        Ok(mut file) => {
            if let Err(_) = file.write_all(&body).await {
                return Err(ApiError::InternalError);
            }
        }
        Err(_) => {
            return Err(ApiError::InternalError);
        }
    }

    let size = body.len();

    Ok(Json(UploadResponse { size }))
}

async fn validate_multipart(mut multipart: Multipart) -> Result<Bytes, ApiError> {
    let mut file_data = None;

    while let Some(field) = multipart.next_field().await.unwrap() {
        let name = field.name().unwrap().to_string();

        if name == "file" {
            file_data = Some(field.bytes().await.unwrap());
        }
    }

    let body = file_data.ok_or(ApiError::MissingField {
        field: "file".to_string(),
    })?;

    if body.is_empty() {
        return Err(ApiError::MissingField {
            field: "body".to_string(),
        });
    }

    Ok(body)
}

fn validate_encryption_header(data: &[u8]) -> Result<(), ApiError> {
    const HEADER: [u8; 4] = [0x45, 0x4E, 0x43, 0x52];

    if data.len() < HEADER.len() || &data[0..HEADER.len()] != &HEADER {
        return Err(ApiError::ValidationError {
            field: "file".to_string(),
            message: "File must be encrypted".to_string(),
        });
    }

    Ok(())
}
