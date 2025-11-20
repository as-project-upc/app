use crate::domain::error::ApiError;
use crate::domain::result::ApiResult;
use crate::repository::user::Role;
use crate::utils::Claims;
use axum::extract::State;
use axum::{response::Json, Extension};
use serde::{Deserialize, Serialize};
use sqlx::SqlitePool;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct UserResponse {
    pub id: String,
    pub username: String,
    pub email: String,
    pub name: String,
    pub surname: String,
    pub role: Role,
}

pub async fn handler(
    Extension(claims): Extension<Claims>,
    State(pool): State<SqlitePool>,
) -> ApiResult<UserResponse> {
    let user_repo = crate::repository::user::UserRepository::new(pool.clone());
    let user = user_repo
        .get_by_username(&claims.username)
        .await
        .map_err(|_| ApiError::DatabaseError)?
        .ok_or_else(|| ApiError::UserNotFound)?;

    Ok(Json(UserResponse {
        id: user.id,
        email: user.email,
        role: claims.role,
        username: claims.username,
        name: user.name,
        surname: user.surname,
    }))
}
