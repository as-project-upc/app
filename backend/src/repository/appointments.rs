use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::{Row, SqlitePool};
use std::str::FromStr;

#[derive(Debug, Clone)]
pub struct AppointmentsRepository {
    pool: SqlitePool,
}

impl AppointmentsRepository {
    pub fn new(pool: SqlitePool) -> Self {
        Self { pool }
    }

    pub async fn create_appointment(
        &self,
        user_id: String,
        doctor_id: String,
        date: DateTime<Utc>,
    ) -> Result<Appointment, sqlx::Error> {
        let appointment = sqlx::query(
            r#"
            INSERT INTO appointment(appointment_id, user_id, date, doctor_id)
            VALUES (?,?, ?, ?)
            RETURNING appointment_id, user_id, date, doctor_id
            "#,
        )
        .bind(&uuid::Uuid::now_v7().to_string())
        .bind(user_id)
        .bind(date.to_rfc3339())
        .bind(doctor_id)
        .fetch_one(&self.pool)
        .await?;

        Ok(from_row(&appointment)?)
    }

    pub async fn get_by_username(&self, username: &str) -> Result<Vec<Appointment>, sqlx::Error> {
        let user = sqlx::query(
            "SELECT appointment_id,user_id, doctor_id, date FROM appointment WHERE user_id = ?",
        )
        .bind(username)
        .fetch_all(&self.pool)
        .await?
        .into_iter()
        .map(|row| from_row(&row))
        .collect::<Result<Vec<_>, _>>()?;

        Ok(user)
    }

    pub async fn get_by_appointment_by_id(
        &self,
        appointment_id: &str,
        user_id: &str,
    ) -> Result<Appointment, sqlx::Error> {
        let user = sqlx::query(
            "SELECT appointment_id, user_id,doctor_id, date FROM appointment WHERE appointment_id = ? and user_id = ?",
        )
        .bind(appointment_id)
        .bind(user_id)
        .fetch_one(&self.pool)
        .await?;

        Ok(from_row(&user)?)
    }

    pub async fn delete_appointment(
        &self,
        appointment_id: &str,
        user_id: &str,
    ) -> Result<(), sqlx::Error> {
        sqlx::query("DELETE FROM appointment WHERE appointment_id = ? and user_id = ?")
            .bind(appointment_id)
            .bind(user_id)
            .execute(&self.pool)
            .await?;
        Ok(())
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Appointment {
    pub appointment_id: String,
    pub user_id: String,
    pub doctor_id: String,
    pub date: DateTime<Utc>,
}

fn from_row(row: &sqlx::sqlite::SqliteRow) -> Result<Appointment, sqlx::Error> {
    let date = DateTime::from_str(row.try_get("date")?).unwrap();
    Ok(Appointment {
        appointment_id: row.try_get("appointment_id")?,
        user_id: row.try_get("user_id")?,
        doctor_id: row.try_get("doctor_id")?,
        date,
    })
}
