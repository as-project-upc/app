use crate::domain::error::ApiError;
use crate::domain::result::ApiResult;
use crate::repository::appointments::AppointmentsRepository;
use crate::repository::user::UserRepository;
use crate::utils::Claims;
use axum::extract::State;
use axum::{Extension, Json};
use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::SqlitePool;

#[derive(Debug, Serialize, Deserialize)]
pub struct AppointmentResponse {
    pub appointment_id: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct AppointmentRequest {
    pub date: DateTime<Utc>,
    pub doctor_id: String,
}

pub async fn add_appointment(
    State(pool): State<SqlitePool>,
    Extension(claims): Extension<Claims>,
    Json(request): Json<AppointmentRequest>,
) -> ApiResult<AppointmentResponse> {
    let user_id = claims.sub;
    let user_repo = UserRepository::new(pool.clone());
    let appointment_repo = AppointmentsRepository::new(pool.clone());

    let _ = user_repo
        .get_by_id(&request.doctor_id)
        .await
        .map_err(|_| ApiError::DatabaseError)?
        .ok_or_else(|| ApiError::ValidationError {
            field: "user_id".to_string(),
            message: "User is not a doctor".to_string(),
        })?;

    let appointment = appointment_repo
        .create_appointment(user_id, request.doctor_id, request.date)
        .await
        .map_err(|_| ApiError::DatabaseError)?;

    Ok(Json(AppointmentResponse {
        appointment_id: appointment.appointment_id,
    }))
}
