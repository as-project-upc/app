use crate::domain::user::{Role, UserDto};
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
    ) -> Result<UserDto, sqlx::Error> {
        let user = sqlx::query_as::<_, UserDto>(
            r#"
            INSERT INTO users (id,username, password_file, email, role)
            VALUES (?,?, ?, ?, ?)
            RETURNING id, username, password_file, email, role
            "#,
        )
        .bind(&uuid::Uuid::now_v7().to_string())
        .bind(&username)
        .bind(&password_file)
        .bind(&email)
        .bind(&role.to_string())
        .fetch_one(&self.pool)
        .await?;

        Ok(user)
    }

    pub async fn get_by_username(&self, username: &str) -> Result<Option<UserDto>, sqlx::Error> {
        let user = sqlx::query_as::<_, UserDto>(
            "SELECT id, username, password_file, email, role FROM users WHERE username = ?",
        )
        .bind(username)
        .fetch_optional(&self.pool)
        .await?;

        Ok(user)
    }

    pub async fn get_doctors(&self) -> Result<Vec<UserDto>, sqlx::Error> {
        let users = sqlx::query_as::<_, UserDto>("SELECT id, username FROM users where role = ?")
            .bind("doctor")
            .fetch_all(&self.pool)
            .await?;

        Ok(users)
    }
}
