use crate::domain::error::{ApiError, ErrorResponse};
use crate::domain::user::Role;
use crate::utils::Claims;
use axum::{
    extract::Request,
    http::StatusCode,
    middleware::Next,
    response::{Json, Response},
};

pub async fn require_admin(
    req: Request,
    next: Next,
) -> Result<Response, (StatusCode, Json<ErrorResponse>)> {
    let claims =
        req.extensions().get::<Claims>().cloned().ok_or_else(
            || -> (StatusCode, Json<ErrorResponse>) { ApiError::Unauthorized.into() },
        )?;

    if claims.role == Role::Admin {
        Ok(next.run(req).await)
    } else {
        Err(ApiError::Forbidden.into())
    }
}

pub async fn require_user(
    req: Request,
    next: Next,
) -> Result<Response, (StatusCode, Json<ErrorResponse>)> {
    let claims =
        req.extensions().get::<Claims>().cloned().ok_or_else(
            || -> (StatusCode, Json<ErrorResponse>) { ApiError::Unauthorized.into() },
        )?;

    if claims.role == Role::User || claims.role == Role::Admin {
        Ok(next.run(req).await)
    } else {
        Err(ApiError::Forbidden.into())
    }
}
