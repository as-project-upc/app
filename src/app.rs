use crate::controllers;
use crate::controllers::websocket::WsState;
use crate::utils::opaque::OpaqueServer;
use crate::utils::{auth_middleware, require_admin};
use axum::http::header::{AUTHORIZATION, CONTENT_TYPE};
use axum::http::{HeaderValue, Method};
use axum::routing::{any, delete, get, post};
use axum::{middleware, Extension, Router};
use axum_server::tls_rustls::RustlsConfig;
use std::net::SocketAddr;
use std::sync::Arc;
use std::time::Duration;
use tokio::signal;
use tower_http::cors::CorsLayer;
use tower_http::trace::{DefaultMakeSpan, DefaultOnRequest, DefaultOnResponse, TraceLayer};
use tracing::Level;

pub struct App {}

impl App {
    pub async fn serve(pool: sqlx::SqlitePool) {
        let opaque_server = OpaqueServer::new(pool.clone()).await;
        let ws_state = WsState::new();

        let public_routes = Router::new()
            .route("/ws", any(controllers::websocket::handler))
            .with_state(ws_state)
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
            .route("/user/{user_id}", get(controllers::user::handler))
            .route(
                "/locker/{file_name}",
                post(controllers::locker::upload_handler),
            )
            .route(
                "/locker/{file_name}",
                delete(controllers::locker::delete_handler),
            )
            .route(
                "/locker/{file_name}",
                get(controllers::locker::download_handler),
            )
            .route("/locker", get(controllers::locker::list_handler))
            .route_layer(middleware::from_fn(auth_middleware));

        let user_routes = Router::new()
            .route("/doctors", get(controllers::doctor::handler))
            .route(
                "/appointment",
                post(controllers::appointment::add_appointment),
            )
            .route(
                "/appointment",
                get(controllers::appointment::list_appointments),
            )
            .route(
                "/appointment/{appointment_id}",
                delete(controllers::appointment::delete_appointment),
            )
            .route(
                "/appointment/{appointment_id}",
                get(controllers::appointment::get_appointment),
            )
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
                CorsLayer::new()
                    .allow_origin(
                        std::env::var("FRONTEND_URL")
                            .expect("Failed to get FRONTEND_URL")
                            .parse::<HeaderValue>()
                            .expect("Failed to parse FRONTEND_URL as HeaderValue"),
                    )
                    .allow_methods(vec![
                        Method::GET,
                        Method::POST,
                        Method::DELETE,
                        Method::OPTIONS,
                    ])
                    .allow_headers([AUTHORIZATION, CONTENT_TYPE])
                    .allow_credentials(false),
            )
            .layer(
                TraceLayer::new_for_http()
                    .make_span_with(
                        DefaultMakeSpan::new()
                            .include_headers(true)
                            .level(Level::TRACE),
                    )
                    .on_response(
                        DefaultOnResponse::new()
                            .include_headers(true)
                            .level(Level::TRACE),
                    )
                    .on_request(DefaultOnRequest::new().level(Level::TRACE)),
            )
            .with_state(pool.clone());

        let port: u16 = std::env::var("PORT")
            .unwrap_or_else(|_| "3000".to_string())
            .parse()
            .expect("PORT must be a number");

        let https_enabled = std::env::var("HTTPS_ENABLED")
            .unwrap_or_else(|_| "false".to_string())
            .parse::<bool>()
            .expect("HTTPS ENABLED must be a bool");

        if https_enabled {
            start_https(app, port).await;
        } else {
            start_http(app, port).await;
        }
    }
}

async fn start_http(app: Router, port: u16) {
    tracing::info!("Server running on http://localhost:3000");
    axum::serve(
        tokio::net::TcpListener::bind(format!("0.0.0.0:{port}"))
            .await
            .unwrap(),
        app.into_make_service_with_connect_info::<SocketAddr>(),
    )
    .with_graceful_shutdown(shutdown_signal())
    .await
    .unwrap();
}

async fn start_https(app: Router, port: u16) {
    tracing::info!("Server running on https://localhost:3000");
    let handle = axum_server::Handle::new();
    tokio::spawn({
        let handle = handle.clone();
        async move {
            shutdown_signal().await;
            handle.graceful_shutdown(Some(Duration::from_secs(30)));
        }
    });

    let pem = std::env::var("CERT_PEM").expect("PEM environment variable is missing");
    let key = std::env::var("KEY_PEM").expect("KEY environment variable is missing");

    axum_server::bind_rustls(
        SocketAddr::from(([0, 0, 0, 0], port)),
        RustlsConfig::from_pem_file(pem, key)
            .await
            .expect("Failed to load certificates"),
    )
    .handle(handle)
    .serve(app.into_make_service_with_connect_info::<SocketAddr>())
    .await
    .unwrap();
}

async fn shutdown_signal() {
    let ctrl_c = async {
        signal::ctrl_c()
            .await
            .expect("Failed to install Ctrl+C handler");
    };

    tokio::select! {
        _ = ctrl_c => {
            tracing::info!("Received Ctrl+C signal, initiating graceful shutdown...");
        }
    }
}
