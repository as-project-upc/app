use crate::domain::error::ApiError;
use crate::domain::result::ApiResult;
use crate::repository::user::UserRepository;
use crate::utils::base64_serde;
use crate::utils::opaque;
use axum::extract::State;
use axum::{Extension, Json};
use opaque_ke::{CredentialRequest, ServerLogin, ServerRegistration};
use rand::rngs::OsRng;
use serde::{Deserialize, Serialize};
use sqlx::SqlitePool;
use std::sync::Arc;

#[derive(Debug, Serialize, Deserialize)]
pub struct LoginStartRequest {
    pub username: String,
    #[serde(with = "base64_serde")]
    pub credential_request: Vec<u8>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct LoginStartResponse {
    #[serde(with = "base64_serde")]
    pub credential_response: Vec<u8>,
}

pub async fn login_start_handler(
    State(pool): State<SqlitePool>,
    Extension(opaque_setup): Extension<Arc<opaque::OpaqueServer>>,
    Json(request): Json<LoginStartRequest>,
) -> ApiResult<LoginStartResponse> {
    let user_repo = UserRepository::new(pool.clone());

    let user = user_repo
        .get_by_username(&request.username)
        .await
        .map_err(|_| ApiError::DatabaseError)?
        .ok_or_else(|| ApiError::InvalidCredentials)?;

    let mut rng = OsRng;

    let password_file =
        ServerRegistration::<opaque::DefaultCipherSuite>::deserialize(&user.password_file)
            .map_err(|_| ApiError::AuthenticationFailed)?;

    let credential_request =
        CredentialRequest::<opaque::DefaultCipherSuite>::deserialize(&request.credential_request)
            .map_err(|_| ApiError::AuthenticationFailed)?;

    let server_login_result = ServerLogin::start(
        &mut rng,
        &opaque_setup.server_setup,
        Some(password_file),
        credential_request,
        &[],
        Default::default(),
    )
    .map_err(|_| ApiError::AuthenticationFailed)?;

    {
        let mut cache = opaque_setup.login_state_cache.lock().unwrap();
        cache.insert(request.username.clone(), server_login_result.state);
    }

    let credential_response = server_login_result.message.serialize().to_vec();

    Ok(Json(LoginStartResponse {
        credential_response,
    }))
}
