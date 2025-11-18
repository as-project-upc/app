use serde::{Deserialize, Serialize};
use sqlx::SqlitePool;
use std::fmt;

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
        let user = sqlx::query(
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

        from_row(&user)
    }

    pub async fn get_by_username(&self, username: &str) -> Result<Option<UserDto>, sqlx::Error> {
        let user = sqlx::query(
            "SELECT id, username, password_file, email, role FROM users WHERE username = ?",
        )
        .bind(username)
        .fetch_optional(&self.pool)
        .await?
        .map(|user| from_row(&user))
        .transpose()?;

        Ok(user)
    }
    pub async fn get_by_id(&self, id: &str) -> Result<Option<UserDto>, sqlx::Error> {
        let user =
            sqlx::query("SELECT id, username, password_file, email, role FROM users WHERE id = ?")
                .bind(id)
                .fetch_optional(&self.pool)
                .await?
                .map(|user| from_row(&user))
                .transpose()?;

        Ok(user)
    }

    pub async fn get_doctors(&self) -> Result<Vec<UserDto>, sqlx::Error> {
        let users = sqlx::query("SELECT id, username FROM users where role = ?")
            .bind("doctor")
            .fetch_all(&self.pool)
            .await?
            .into_iter()
            .map(|user| from_row(&user))
            .collect::<Result<Vec<UserDto>, _>>()?;

        Ok(users)
    }
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "lowercase")]
pub enum Role {
    Admin,
    Doctor,
    User,
}

impl fmt::Display for Role {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Role::User => write!(f, "user"),
            Role::Admin => write!(f, "admin"),
            Role::Doctor => write!(f, "doctor"),
        }
    }
}

impl From<String> for Role {
    fn from(s: String) -> Self {
        Role::from(s.to_lowercase().as_str())
    }
}

impl From<&str> for Role {
    fn from(s: &str) -> Self {
        match s {
            "admin" => Role::Admin,
            _ => Role::User,
        }
    }
}

impl From<Role> for String {
    fn from(role: Role) -> Self {
        role.to_string()
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UserDto {
    pub id: String,
    pub username: String,
    #[serde(skip_serializing)]
    pub password_file: Vec<u8>,
    pub email: String,
    pub role: Role,
}

fn from_row(row: &sqlx::sqlite::SqliteRow) -> Result<UserDto, sqlx::Error> {
    use sqlx::Row;

    let role_str: String = row.try_get("role")?;

    Ok(UserDto {
        id: row.try_get("id")?,
        username: row.try_get("username")?,
        password_file: row.try_get("password_file")?,
        email: row.try_get("email")?,
        role: Role::from(role_str.as_str()),
    })
}
