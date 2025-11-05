use crate::domain::error::ApiError;
use crate::domain::result::ApiResult;
use crate::repository::user::UserRepository;
use crate::utils::base64_serde;
use crate::utils::jwt;
use crate::utils::opaque;
use axum::extract::State;
use axum::{Extension, Json};
use opaque_ke::CredentialFinalization;
use serde::{Deserialize, Serialize};
use sqlx::SqlitePool;
use std::sync::Arc;

#[derive(Debug, Serialize, Deserialize)]
pub struct LoginResponse {
    pub token: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct LoginFinishRequest {
    pub username: String,
    #[serde(with = "base64_serde")]
    pub credential_finalization: Vec<u8>,
}

pub async fn login_finish_handler(
    State(pool): State<SqlitePool>,
    Extension(opaque_setup): Extension<Arc<opaque::OpaqueServer>>,
    Json(request): Json<LoginFinishRequest>,
) -> ApiResult<LoginResponse> {
    let server_login_state = {
        let mut cache = opaque_setup.login_state_cache.lock().unwrap();
        cache
            .remove(&request.username)
            .ok_or_else(|| ApiError::InvalidCredentials)?
    };

    let credential_finalization =
        CredentialFinalization::<opaque::DefaultCipherSuite>::deserialize(
            &request.credential_finalization,
        )
        .map_err(|_| ApiError::InvalidCredentials)?;

    let _session_key = server_login_state
        .finish(credential_finalization, Default::default())
        .map_err(|_| ApiError::InvalidCredentials)?
        .session_key;

    let user_repo = UserRepository::new(pool.clone());
    let user = user_repo
        .get_by_username(&request.username)
        .await
        .map_err(|_| ApiError::DatabaseError)?
        .ok_or_else(|| ApiError::InvalidCredentials)?;

    let token = jwt::generate_token(
        user.id,
        user.username.clone(),
        user.email.clone(),
        user.role.clone(),
    )
    .map_err(|_| ApiError::TokenGenerationFailed)?;

    Ok(Json(LoginResponse { token }))
}
