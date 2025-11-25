use sqlx::sqlite::{SqliteConnectOptions, SqlitePoolOptions};
use std::str::FromStr;

mod app;
mod controllers;
mod domain;
mod middlewares;
mod repository;
mod utils;

#[tokio::main]
async fn main() {
    dotenvy::dotenv().expect("Failed to read .env file");

    tracing_subscriber::fmt()
        .with_env_filter(EnvFilter::from_default_env())
        .with_target(false)
        .with_level(true)
        .with_line_number(true)
        .compact()
        .init();

    let database_url =
        std::env::var("DATABASE_URL").unwrap_or_else(|_| "sqlite://auth.db".to_string());

    let connect_options = SqliteConnectOptions::from_str(&database_url)
        .expect("Failed to parse database URL")
        .create_if_missing(true);

    let pool = SqlitePoolOptions::new()
        .max_connections(5)
        .connect_with(connect_options)
        .await
        .expect("Failed to connect to database");

    sqlx::migrate!("./migrations")
        .run(&pool)
        .await
        .expect("Failed to run migrations");

    app::App::serve(pool).await;
}
