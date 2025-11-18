use crate::domain::error::ApiError;
use crate::domain::result::ApiResult;
use crate::repository::appointments::{Appointment, AppointmentsRepository};
use crate::repository::user::UserRepository;
use axum::extract::State;
use axum::Json;
use sqlx::SqlitePool;

pub async fn list_appointments(
    State(pool): State<SqlitePool>,
    axum::extract::Path(user_id): axum::extract::Path<String>,
) -> ApiResult<Vec<Appointment>> {
    let user_repo = UserRepository::new(pool.clone());
    let appointment_repo = AppointmentsRepository::new(pool.clone());

    let _ = user_repo
        .get_by_id(&user_id)
        .await
        .map_err(|_| ApiError::DatabaseError)?
        .ok_or_else(|| ApiError::ValidationError {
            field: "user_id".to_string(),
            message: "User is not a doctor".to_string(),
        })?;

    let appointments = appointment_repo
        .get_by_username(&user_id)
        .await
        .map_err(|_| crate::domain::error::ApiError::DatabaseError)?;

    Ok(Json(appointments))
}
