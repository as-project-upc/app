use crate::domain::error::{ApiError, ErrorResponse};
use crate::utils::jwt;
use axum::{
    extract::Request,
    http::header,
    middleware::Next,
    response::{IntoResponse, Response},
};

pub async fn auth_middleware(mut req: Request, next: Next) -> Result<Response, impl IntoResponse> {
    let auth_header = req
        .headers()
        .get(header::AUTHORIZATION)
        .and_then(|header| header.to_str().ok());

    let auth_header = match auth_header {
        Some(header) => header,
        None => {
            let error: (axum::http::StatusCode, axum::Json<ErrorResponse>) =
                ApiError::Unauthorized.into();
            return Err(error);
        }
    };

    let token = match auth_header.strip_prefix("Bearer ") {
        Some(t) => t,
        None => {
            return Err(ApiError::TokenInvalid.into());
        }
    };

    let claims = match jwt::validate_token(token) {
        Ok(c) => c,
        Err(_) => {
            return Err(ApiError::TokenInvalid.into());
        }
    };

    req.extensions_mut().insert(claims);

    Ok(next.run(req).await)
}
