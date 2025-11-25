use sqlx::SqlitePool;

#[derive(Debug, Clone)]
pub struct ServerDataRepository {
    pool: SqlitePool,
}

impl ServerDataRepository {
    pub fn new(pool: SqlitePool) -> Self {
        Self { pool }
    }

    pub async fn get_opaque_key(&self) -> Result<Vec<u8>, sqlx::Error> {
        let data = sqlx::query_scalar("SELECT data FROM server_data WHERE id = 'opaque_key'")
            .fetch_one(&self.pool)
            .await?;

        Ok(data)
    }

    pub async fn set_opaque_key(&self, data: Vec<u8>) -> Result<(), sqlx::Error> {
        sqlx::query(
            "INSERT INTO server_data (id, data) VALUES ('opaque_key', ?)
             ON CONFLICT(id) DO UPDATE SET data = excluded.data",
        )
        .bind(data)
        .execute(&self.pool)
        .await?;

        Ok(())
    }
}
