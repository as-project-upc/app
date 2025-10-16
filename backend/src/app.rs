use crate::controllers;
use axum::Router;
use axum::routing::get;

pub struct App {}

impl App {
    fn new() -> Self {
        App {}
    }

    pub async fn serve() {
        let app = Router::new()
            .route("/login", get(controllers::login::handler))
            .route("/logout", get(controllers::logout::handler));

        // run our app with hyper, listening globally on port 3000
        let listener = tokio::net::TcpListener::bind("0.0.0.0:3000").await.unwrap();
        axum::serve(listener, app).await.unwrap();
    }
}
