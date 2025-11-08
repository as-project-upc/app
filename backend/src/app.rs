use crate::controllers;
use crate::utils::opaque::OpaqueServer;
use crate::utils::{auth_middleware, require_admin, require_user};
use axum::http::header::AUTHORIZATION;
use axum::http::HeaderValue;
use axum::routing::{delete, get, post};
use axum::{middleware, Extension, Router};
use std::sync::Arc;
use tokio::signal;
use tower_http::cors::CorsLayer;
use tower_http::trace::{DefaultMakeSpan, DefaultOnRequest, DefaultOnResponse, TraceLayer};
use tracing::Level;

pub struct App {}

impl App {
    pub async fn serve(pool: sqlx::SqlitePool) {
        let opaque_server = OpaqueServer::new(pool.clone()).await;

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
            .route_layer(Extension(Arc::new(opaque_server)));

        let protected_routes = Router::new()
            .route("/me", get(controllers::me::handler))
            .route("/locker/{file_name}", post(controllers::locker::upload_handler))
            .route("/locker/{file_name}", delete(controllers::locker::delete_handler))
            .route("/locker/{file_name}", get(controllers::locker::download_handler))
            .route("/locker", get(controllers::locker::list_handler))
            .route_layer(middleware::from_fn(auth_middleware));

        let user_routes = Router::new()
            .route("/user", get(controllers::user::handler))
            .route_layer(middleware::from_fn(require_user))
            .route_layer(middleware::from_fn(auth_middleware));

        let admin_routes = Router::new()
            .route("/admin", get(controllers::admin::handler))
            .route_layer(middleware::from_fn(require_admin))
            .route_layer(middleware::from_fn(auth_middleware));

        let api_routes = Router::new()
            .merge(public_routes)
            .merge(protected_routes)
            .merge(user_routes)
            .merge(admin_routes);

        let app = Router::new()
            .nest("/api", api_routes)
            .fallback(controllers::static_files::handler)
            .layer(
                CorsLayer::permissive()
                    .allow_origin(
                        std::env::var("FRONTEND_URL")
                            .expect("Failed to get FRONTEND_URL")
                            .parse::<HeaderValue>()
                            .expect("Failed to parse FRONTEND_URL as HeaderValue"),
                    )
                    .allow_headers([AUTHORIZATION])
                    .allow_credentials(false),
            )
            .layer(
                TraceLayer::new_for_http()
                    .make_span_with(DefaultMakeSpan::new().level(Level::INFO))
                    .on_response(DefaultOnResponse::new().level(Level::TRACE))
                    .on_request(DefaultOnRequest::new().level(Level::TRACE)),
            )
            .with_state(pool.clone());

        let listener = tokio::net::TcpListener::bind("0.0.0.0:3000").await.unwrap();

        tracing::info!("Server running on http://localhost:3000");
        tracing::info!("Frontend dev server available at http://localhost:3000/dev/");

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
