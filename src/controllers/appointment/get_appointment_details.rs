use crate::domain::error::ApiError;
use crate::domain::result::ApiResult;
use crate::repository::appointments::Appointment;
use crate::utils::Claims;
use axum::extract::State;
use axum::{Extension, Json};
use sqlx::SqlitePool;

pub async fn get_appointment(
    State(pool): State<SqlitePool>,
    axum::extract::Path(appointment_id): axum::extract::Path<String>,
    Extension(claims): Extension<Claims>,
) -> ApiResult<Appointment> {
    let appointment_repo = crate::repository::appointments::AppointmentsRepository::new(pool);
    let appointment = appointment_repo
        .get_by_appointment_by_id(&appointment_id, &claims.sub)
        .await
        .map_err(|_| ApiError::AppointmentNotFound)?;

    Ok(Json(appointment))
}
