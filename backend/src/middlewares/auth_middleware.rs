use crate::domain::error::ApiError;
use crate::utils::jwt;
use axum::{
    extract::Request,
    http::header,
    middleware::Next,
    response::{IntoResponse, Response},
};

pub async fn auth_middleware(mut req: Request, next: Next) -> Response {
    let auth_header = req
        .headers()
        .get(header::AUTHORIZATION)
        .and_then(|header| header.to_str().ok());

    let auth_header = match auth_header {
        Some(header) => header,
        None => return ApiError::Unauthorized.into_response(),
    };

    let token = match auth_header.strip_prefix("Bearer ") {
        Some(t) => t,
        None => return ApiError::TokenInvalid.into_response(),
    };

    let claims = match jwt::validate_token(token) {
        Ok(c) => c,
        Err(_) => return ApiError::TokenInvalid.into_response(),
    };

    req.extensions_mut().insert(claims);

    next.run(req).await
}
