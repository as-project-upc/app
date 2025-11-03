use crate::domain::user::{Role, User};
use sqlx::SqlitePool;

#[derive(Debug, Clone)]
pub struct UserRepository {
    pool: SqlitePool,
}

impl UserRepository {
    pub fn new(pool: SqlitePool) -> Self {
        Self { pool }
    }

    pub async fn create_user(
        &self,
        username: String,
        email: String,
        password_file: Vec<u8>,
        role: Role,
    ) -> Result<User, sqlx::Error> {
        let user = sqlx::query_as::<_, User>(
            r#"
            INSERT INTO users (username, password_file, email, role)
            VALUES (?, ?, ?, ?)
            RETURNING id, username, password_file, email, role
            "#,
        )
        .bind(&username)
        .bind(&password_file)
        .bind(&email)
        .bind(&role.to_string())
        .fetch_one(&self.pool)
        .await?;

        Ok(user)
    }

    pub async fn get_by_username(&self, username: &str) -> Result<Option<User>, sqlx::Error> {
        let user = sqlx::query_as::<_, User>(
            "SELECT id, username, password_file, email, role FROM users WHERE username = ?",
        )
        .bind(username)
        .fetch_optional(&self.pool)
        .await?;

        Ok(user)
    }
}
