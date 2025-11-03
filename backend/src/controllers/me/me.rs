use crate::domain::error::ApiError;
use crate::domain::result::ApiResult;
use crate::domain::user::Role;
use crate::utils::Claims;
use axum::{extract::Request, response::Json};
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct UserResponse {
    pub id: i32,
    pub username: String,
    pub email: String,
    pub role: Role,
}

pub async fn handler(req: Request) -> ApiResult<UserResponse> {
    let claims = req
        .extensions()
        .get::<Claims>()
        .ok_or_else(|| ApiError::Unauthorized)?
        .clone();

    let user = UserResponse {
        id: claims.sub.parse::<i32>().unwrap_or(0),
        username: claims.username,
        email: claims.email,
        role: claims.role,
    };

    Ok(Json(user))
}
