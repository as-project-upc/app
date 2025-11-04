use crate::controllers;
use crate::utils::{auth_middleware, opaque::OpaqueServer, require_admin, require_user};
use axum::routing::{get, post};
use axum::{middleware, Extension, Router};
use std::sync::Arc;
use tokio::signal;
use tower_http::trace::{DefaultMakeSpan, DefaultOnResponse, TraceLayer};
use tower_http::LatencyUnit;
use tracing::Level;

pub struct App {}

impl App {
    pub async fn serve(pool: sqlx::SqlitePool) {
        let public_routes = Router::new()
            .route(
                "/register/start",
                post(controllers::register::register_start_handler),
            )
            .route(
                "/register/finish",
                post(controllers::register::register_finish_handler),
            )
            .route(
                "/login/start",
                post(controllers::login::login_start_handler),
            )
            .route(
                "/login/finish",
                post(controllers::login::login_finish_handler),
            )
            .layer(Extension(Arc::new(OpaqueServer::new(
                std::env::var("OPAQUE_SERVER_KEY")
                    .expect("Failed to get OPAQUE_SERVER_KEY")
                    .as_str(),
            ))))
            .with_state(pool.clone());

        let protected_routes = Router::new()
            .route("/me", get(controllers::me::handler))
            .route("/locker", post(controllers::locker::upload_handler))
            .route("/locker", get(controllers::locker::download_handler))
            .layer(middleware::from_fn(auth_middleware));

        let user_routes = Router::new()
            .route("/user", get(controllers::user::handler))
            .layer(middleware::from_fn(require_user))
            .layer(middleware::from_fn(auth_middleware));

        let admin_routes = Router::new()
            .route("/admin", get(controllers::admin::handler))
            .layer(middleware::from_fn(require_admin))
            .layer(middleware::from_fn(auth_middleware));

        let app = public_routes
            .merge(protected_routes)
            .merge(user_routes)
            .merge(admin_routes)
            .layer(
                TraceLayer::new_for_http()
                    .make_span_with(DefaultMakeSpan::new().level(Level::INFO))
                    .on_response(
                        DefaultOnResponse::new()
                            .level(Level::INFO)
                            .latency_unit(LatencyUnit::Millis),
                    ),
            );

        let listener = tokio::net::TcpListener::bind("0.0.0.0:3000").await.unwrap();

        tracing::info!("Server running on http://localhost:3000");

        axum::serve(listener, app)
            .with_graceful_shutdown(shutdown_signal())
            .await
            .unwrap();

        pool.close().await;
    }
}

async fn shutdown_signal() {
    let ctrl_c = async {
        signal::ctrl_c()
            .await
            .expect("Failed to install Ctrl+C handler");
    };

    #[cfg(not(unix))]
    let terminate = std::future::pending::<()>();

    tokio::select! {
        _ = ctrl_c => {
            tracing::info!("Received Ctrl+C signal, initiating graceful shutdown...");
        }
        _ = terminate => {},
    }
}
