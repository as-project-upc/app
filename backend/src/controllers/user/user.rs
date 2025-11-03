use crate::domain::error::ApiError;
use crate::domain::result::ApiResult;
use crate::domain::user::Role;
use crate::utils::Claims;
use axum::{extract::Request, response::Json};
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

pub async fn handler(req: Request) -> ApiResult<UserDashboardResponse> {
    let claims = req
        .extensions()
        .get::<Claims>()
        .ok_or_else(|| ApiError::Unauthorized)?
        .clone();

    Ok(Json(UserDashboardResponse::new(
        claims.username,
        claims.role,
    )))
}
