use crate::domain::error::ApiError;
use crate::domain::result::ApiResult;
use crate::repository::user::UserRepository;
use crate::utils::base64_serde;
use crate::utils::opaque;
use axum::extract::State;
use axum::{Extension, Json};
use opaque_ke::{RegistrationRequest, ServerRegistration};
use serde::{Deserialize, Serialize};
use sqlx::SqlitePool;
use std::sync::Arc;

#[derive(Debug, Serialize, Deserialize)]
pub struct RegistrationStartRequest {
    pub username: String,
    pub email: String,
    #[serde(with = "base64_serde")]
    pub registration_request: Vec<u8>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct RegistrationStartResponse {
    #[serde(with = "base64_serde")]
    pub registration_response: Vec<u8>,
}

pub async fn register_start_handler(
    State(pool): State<SqlitePool>,
    Extension(opaque_setup): Extension<Arc<opaque::OpaqueServer>>,
    Json(request): Json<RegistrationStartRequest>,
) -> ApiResult<RegistrationStartResponse> {
    let user_repo = UserRepository::new(pool.clone());

    match user_repo.get_by_username(&request.username).await {
        Ok(Some(_)) => {
            return Err(ApiError::UsernameExists);
        }
        Ok(None) => {}
        Err(_) => {
            return Err(ApiError::DatabaseError);
        }
    }

    let registration_request = RegistrationRequest::<opaque::DefaultCipherSuite>::deserialize(
        &request.registration_request,
    )
    .map_err(|_| ApiError::AuthenticationFailed)?;

    let registration_response = ServerRegistration::<opaque::DefaultCipherSuite>::start(
        &opaque_setup.server_setup,
        registration_request,
        &[],
    )
    .map_err(|_| ApiError::AuthenticationFailed)?;

    let registration_response_bytes = registration_response.message.serialize().to_vec();

    Ok(Json(RegistrationStartResponse {
        registration_response: registration_response_bytes,
    }))
}
