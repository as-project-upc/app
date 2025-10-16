mod app;
mod controllers;
mod domain;
mod repository;

#[tokio::main]
async fn main() {
    app::App::serve().await;
}
