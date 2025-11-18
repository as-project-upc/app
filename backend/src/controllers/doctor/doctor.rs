use crate::domain::error::ApiError;
use crate::domain::result::ApiResult;
use crate::repository::user::UserRepository;
use axum::extract::State;
use axum::Json;
use serde::{Deserialize, Serialize};
use sqlx::SqlitePool;

#[derive(Debug, Serialize, Deserialize)]
pub struct DoctorResponse {
    pub username: String,
    pub id: String,
}

pub async fn handler(State(pool): State<SqlitePool>) -> ApiResult<Vec<DoctorResponse>> {
    let user_repo = UserRepository::new(pool.clone());

    let user = user_repo
        .get_doctors()
        .await
        .map_err(|_| ApiError::DatabaseError)?
        .into_iter()
        .map(|user| DoctorResponse {
            username: user.username,
            id: user.id,
        })
        .collect::<Vec<_>>();

    Ok(Json(user))
}
