use crate::domain::result::ApiResult;
use crate::domain::user::Role;
use crate::utils::Claims;
use axum::{response::Json, Extension};
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct UserDashboardResponse {
    pub username: String,
    pub role: Role,
}

impl UserDashboardResponse {
    pub fn new(username: String, role: Role) -> Self {
        Self { username, role }
    }
}

pub async fn handler(Extension(claims): Extension<Claims>) -> ApiResult<UserDashboardResponse> {
    Ok(Json(UserDashboardResponse::new(
        claims.username,
        claims.role,
    )))
}
