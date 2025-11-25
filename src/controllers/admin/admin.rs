use crate::domain::result::ApiResult;
use crate::repository::user::Role;
use crate::utils::Claims;
use axum::{response::Json, Extension};
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct AdminDashboardResponse {
    pub username: String,
    pub role: Role,
}

impl AdminDashboardResponse {
    pub fn new(username: String, role: Role) -> Self {
        Self { username, role }
    }
}

pub async fn handler(Extension(claims): Extension<Claims>) -> ApiResult<AdminDashboardResponse> {
    Ok(Json(AdminDashboardResponse::new(
        claims.username,
        claims.role,
    )))
}
