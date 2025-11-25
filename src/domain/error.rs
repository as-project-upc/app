use axum::response::{IntoResponse, Response};
use axum::Json;
use serde::{Deserialize, Serialize};
use thiserror::Error;

#[derive(Debug, Clone, Error, Serialize, Deserialize)]
#[serde(tag = "error_type", content = "details")]
pub enum ApiError {
    #[error("Unauthorized access")]
    Unauthorized,

    #[error("Forbidden: insufficient permissions")]
    Forbidden,

    #[error("Invalid username or password")]
    InvalidCredentials,

    #[error("Token has expired")]
    TokenExpired,

    #[error("Invalid token")]
    TokenInvalid,

    #[error("Session has expired")]
    SessionExpired,

    #[error("Validation error for {field}: {message}")]
    ValidationError { field: String, message: String },

    #[error("Invalid email format")]
    InvalidEmail,

    #[error("Password must be at least 6 characters")]
    WeakPassword,

    #[error("{field} is required")]
    MissingField { field: String },

    #[error("Username already exists")]
    UsernameExists,

    #[error("Email already exists")]
    EmailExists,

    #[error("Database error occurred")]
    DatabaseError,

    #[error("User not found")]
    UserNotFound,

    #[error("Appointment not found")]
    AppointmentNotFound,

    #[error("File not found")]
    FileNotFound,

    #[error("Internal server error")]
    InternalError,

    #[error("Failed to generate token")]
    TokenGenerationFailed,

    #[error("Authentication failed")]
    AuthenticationFailed,
}

impl ApiError {
    pub fn message(&self) -> String {
        self.to_string()
    }

    pub fn status_code(&self) -> axum::http::StatusCode {
        use axum::http::StatusCode;

        match self {
            ApiError::Unauthorized
            | ApiError::InvalidCredentials
            | ApiError::TokenExpired
            | ApiError::TokenInvalid
            | ApiError::SessionExpired => StatusCode::UNAUTHORIZED,

            ApiError::Forbidden => StatusCode::FORBIDDEN,

            ApiError::ValidationError { .. }
            | ApiError::InvalidEmail
            | ApiError::WeakPassword
            | ApiError::MissingField { .. } => StatusCode::BAD_REQUEST,

            ApiError::UsernameExists | ApiError::EmailExists => StatusCode::CONFLICT,

            ApiError::UserNotFound | ApiError::AppointmentNotFound | ApiError::FileNotFound => {
                StatusCode::NOT_FOUND
            }

            ApiError::DatabaseError
            | ApiError::InternalError
            | ApiError::TokenGenerationFailed
            | ApiError::AuthenticationFailed => StatusCode::INTERNAL_SERVER_ERROR,
        }
    }
}

#[derive(Debug, Serialize, Deserialize)]
struct ErrorResponse {
    pub message: String,
    pub error: ApiError,
}

impl IntoResponse for ApiError {
    fn into_response(self) -> Response {
        (
            self.status_code(),
            Json(ErrorResponse {
                message: self.message(),
                error: self,
            }),
        )
            .into_response()
    }
}
