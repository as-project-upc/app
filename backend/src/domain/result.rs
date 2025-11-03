use crate::domain::error::ErrorResponse;
use axum::{http::StatusCode, response::Json};

pub type ApiResult<T> = Result<Json<T>, (StatusCode, Json<ErrorResponse>)>;
