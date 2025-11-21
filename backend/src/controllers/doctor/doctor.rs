use crate::domain::error::ApiError;
use crate::domain::result::ApiResult;
use crate::repository::appointments::{Appointment, AppointmentsRepository};
use crate::repository::user::UserRepository;
use axum::extract::State;
use axum::Json;
use futures_util::future::join_all;
use serde::{Deserialize, Serialize};
use sqlx::SqlitePool;

#[derive(Debug, Serialize, Deserialize)]
pub struct DoctorResponse {
    pub id: String,
    pub username: String,
    pub name: String,
    pub surname: String,
    pub appointments: Vec<Appointment>,
}

pub async fn handler(State(pool): State<SqlitePool>) -> ApiResult<Vec<DoctorResponse>> {
    let user_repo = UserRepository::new(pool.clone());
    let appointment_repo = AppointmentsRepository::new(pool.clone());

    let user = user_repo
        .get_doctors()
        .await
        .map_err(|_| ApiError::DatabaseError)?
        .into_iter()
        .map(async |user| DoctorResponse {
            username: user.username,
            name: user.name,
            surname: user.surname,
            appointments: appointment_repo
                .get_by_doctor_id(&user.id)
                .await
                .unwrap_or_default(),
            id: user.id,
        })
        .collect::<Vec<_>>();

    let user = join_all(user)
        .await
        .into_iter()
        .collect::<Vec<DoctorResponse>>();

    Ok(Json(user))
}
