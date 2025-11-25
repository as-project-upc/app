use crate::domain::error::ApiError;
use crate::domain::result::ApiResult;
use crate::repository::user::UserRepository;
use axum::extract::State;
use axum::Json;
use serde::{Deserialize, Serialize};
use sqlx::SqlitePool;

#[derive(Debug, Serialize, Deserialize)]
pub struct UserResponse {
    pub id: String,
    pub username: String,
    pub name: String,
    pub surname: String,
}

pub async fn handler(
    State(pool): State<SqlitePool>,
    axum::extract::Path(user_id): axum::extract::Path<String>,
) -> ApiResult<UserResponse> {
    let user_repo = UserRepository::new(pool.clone());

    let user = user_repo
        .get_by_id(&user_id)
        .await
        .map_err(|_| ApiError::DatabaseError)?
        .map(async |user| UserResponse {
            id: user.id,
            username: user.username,
            name: user.name,
            surname: user.surname,
        })
        .ok_or_else(|| ApiError::UserNotFound)?
        .await;

    Ok(Json(user))
}
