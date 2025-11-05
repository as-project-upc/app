use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use std::fmt;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "lowercase")]
pub enum Role {
    Admin,
    User,
}

impl fmt::Display for Role {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Role::User => write!(f, "user"),
            Role::Admin => write!(f, "admin"),
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

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct User {
    pub id: String,
    pub username: String,
    #[serde(skip_serializing)]
    pub password_file: Vec<u8>,
    pub email: String,
    pub role: Role,
}

impl<'r> sqlx::FromRow<'r, sqlx::sqlite::SqliteRow> for User {
    fn from_row(row: &'r sqlx::sqlite::SqliteRow) -> Result<Self, sqlx::Error> {
        use sqlx::Row;

        let role_str: String = row.try_get("role")?;

        Ok(User {
            id: row.try_get("id")?,
            username: row.try_get("username")?,
            password_file: row.try_get("password_file")?,
            email: row.try_get("email")?,
            role: Role::from(role_str.as_str()),
        })
    }
}
