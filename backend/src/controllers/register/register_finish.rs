use crate::domain::error::ApiError;
use crate::domain::result::ApiResult;
use crate::repository::user::{Role, UserRepository};
use crate::utils::{base64_serde, jwt};
use axum::extract::State;
use axum::Json;
use serde::{Deserialize, Serialize};
use sqlx::SqlitePool;

#[derive(Debug, Serialize, Deserialize)]
pub struct RegisterResponse {
    pub token: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct RegistrationFinishRequest {
    pub username: String,
    pub name: String,
    pub surname: String,
    pub email: String,
    #[serde(with = "base64_serde")]
    pub registration_record: Vec<u8>,
    pub role: Role,
}

pub async fn register_finish_handler(
    State(pool): State<SqlitePool>,
    Json(request): Json<RegistrationFinishRequest>,
) -> ApiResult<RegisterResponse> {
    if request.username.is_empty() || request.email.is_empty() {
        return Err(ApiError::MissingField {
            field: "username or email".to_string(),
        });
    }
    dbg!(&request);

    if !request.email.contains('@') {
        return Err(ApiError::InvalidEmail);
    }

    let user_repo = UserRepository::new(pool.clone());
    let password_file = request.registration_record.clone();

    match user_repo
        .create_user(
            request.username.clone(),
            request.name.clone(),
            request.surname.clone(),
            request.email.clone(),
            password_file,
            request.role,
        )
        .await
    {
        Ok(user) => {
            let token = jwt::generate_token(
                user.id,
                user.username.clone(),
                user.email.clone(),
                user.role.clone(),
            )
            .map_err(|_| ApiError::TokenGenerationFailed)?;

            Ok(Json(RegisterResponse { token }))
        }
        Err(e) => {
            if e.to_string().contains("UNIQUE") {
                Err(ApiError::EmailExists)
            } else {
                tracing::error!("Database error: {:?}", e);
                Err(ApiError::DatabaseError)
            }
        }
    }
}
