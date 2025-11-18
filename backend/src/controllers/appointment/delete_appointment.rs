use crate::domain::error::ApiError;
use crate::domain::result::ApiResult;
use crate::repository::appointments::AppointmentsRepository;
use crate::repository::user::UserRepository;
use crate::utils::Claims;
use axum::extract::State;
use axum::{Extension, Json};
use serde::{Deserialize, Serialize};
use sqlx::SqlitePool;

#[derive(Debug, Serialize, Deserialize)]
pub struct AppointmentRequest {
    pub appointment_id: String,
}

pub async fn delete_appointment(
    Extension(claims): Extension<Claims>,
    State(pool): State<SqlitePool>,
    Json(request): Json<AppointmentRequest>,
) -> ApiResult<()> {
    let user_repo = UserRepository::new(pool.clone());
    let appointment_repo = AppointmentsRepository::new(pool.clone());

    let _ = user_repo
        .get_by_id(&claims.sub)
        .await
        .map_err(|_| ApiError::DatabaseError)?
        .ok_or_else(|| ApiError::ValidationError {
            field: "user_id".to_string(),
            message: "User is not a doctor".to_string(),
        })?;

    appointment_repo
        .delete_appointment(&request.appointment_id, &claims.sub)
        .await
        .map_err(|_| ApiError::DatabaseError)?;

    Ok(Json(()))
}
