use crate::domain::user::Role;
use jsonwebtoken::{decode, encode, Algorithm, DecodingKey, EncodingKey, Header, Validation};
use serde::{Deserialize, Serialize};
use std::time::{SystemTime, UNIX_EPOCH};

const TOKEN_EXPIRATION: u64 = 24 * 60 * 60;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Claims {
    pub sub: String,
    pub username: String,
    pub email: String,
    pub role: Role,
    pub exp: u64,
    pub iat: u64,
}

fn get_jwt_secret() -> String {
    std::env::var("JWT_SECRET").expect("JWT_SECRET must be set")
}

impl Claims {
    pub fn new(user_id: i32, username: String, email: String, role: Role) -> Self {
        let now = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .expect("Time went backwards")
            .as_secs();

        Self {
            sub: user_id.to_string(),
            username,
            email,
            role,
            exp: now + TOKEN_EXPIRATION,
            iat: now,
        }
    }
}

pub fn generate_token(
    user_id: i32,
    username: String,
    email: String,
    role: Role,
) -> Result<String, String> {
    let claims = Claims::new(user_id, username, email, role);

    encode(
        &Header::default(),
        &claims,
        &EncodingKey::from_secret(get_jwt_secret().as_bytes()),
    )
    .map_err(|e| format!("Failed to generate token: {}", e))
}

pub fn validate_token(token: &str) -> Result<Claims, String> {
    decode::<Claims>(
        token,
        &DecodingKey::from_secret(get_jwt_secret().as_bytes()),
        &Validation::new(Algorithm::HS256),
    )
    .map(|data| data.claims)
    .map_err(|e| format!("Invalid token: {}", e))
}
