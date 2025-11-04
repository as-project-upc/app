use crate::domain::result::ApiResult;
use crate::domain::user::Role;
use crate::utils::Claims;
use axum::{response::Json, Extension};
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct UserResponse {
    pub id: i32,
    pub username: String,
    pub email: String,
    pub role: Role,
}

pub async fn handler(Extension(claims): Extension<Claims>) -> ApiResult<UserResponse> {
    let user = UserResponse {
        id: claims.sub.parse::<i32>().unwrap_or(0),
        username: claims.username,
        email: claims.email,
        role: claims.role,
    };

    Ok(Json(user))
}
