use crate::domain::error::ApiError;
use crate::repository::user::Role;
use crate::utils::Claims;
use axum::{
    extract::Request,
    middleware::Next,
    response::{IntoResponse, Response},
};

pub async fn require_admin(req: Request, next: Next) -> Response {
    let claims = match req.extensions().get::<Claims>().cloned() {
        Some(claims) => claims,
        None => return ApiError::Unauthorized.into_response(),
    };

    if claims.role == Role::Admin {
        next.run(req).await
    } else {
        ApiError::Forbidden.into_response()
    }
}

pub async fn require_user(req: Request, next: Next) -> Response {
    let claims = match req.extensions().get::<Claims>().cloned() {
        Some(claims) => claims,
        None => return ApiError::Unauthorized.into_response(),
    };

    if claims.role == Role::User || claims.role == Role::Admin {
        next.run(req).await
    } else {
        ApiError::Forbidden.into_response()
    }
}
