use crate::domain::result::ApiResult;
use crate::domain::user::Role;
use crate::utils::Claims;
use axum::{response::Json, Extension};
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct UserResponse {
    pub id: String,
    pub username: String,
    pub email: String,
    pub role: Role,
}

pub async fn handler(Extension(claims): Extension<Claims>) -> ApiResult<UserResponse> {
    let user = UserResponse {
        id: claims.sub,
        username: claims.username,
        email: claims.email,
        role: claims.role,
    };

    Ok(Json(user))
}
