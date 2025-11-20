use crate::domain::error::ApiError;
use crate::domain::result::ApiResult;
use crate::repository::appointments::AppointmentsRepository;
use crate::utils::Claims;
use axum::extract::State;
use axum::{Extension, Json};
use sqlx::SqlitePool;

pub async fn delete_appointment(
    Extension(claims): Extension<Claims>,
    axum::extract::Path(appointment_id): axum::extract::Path<String>,
    State(pool): State<SqlitePool>,
) -> ApiResult<()> {
    let appointment_repo = AppointmentsRepository::new(pool.clone());
    dbg!(&claims);
    appointment_repo
        .get_by_appointment_by_id(&appointment_id, &claims.sub)
        .await
        .map_err(|_| ApiError::AppointmentNotFound)?;

    appointment_repo
        .delete_appointment(&appointment_id, &claims.sub)
        .await
        .map_err(|_| ApiError::DatabaseError)?;

    Ok(Json(()))
}
