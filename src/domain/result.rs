use crate::domain::error::ApiError;
use axum::response::Json;

pub type ApiResult<T> = Result<Json<T>, ApiError>;
