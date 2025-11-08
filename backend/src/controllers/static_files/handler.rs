use crate::domain::error::ApiError;
use axum::body::Body;
use axum::http::{header, StatusCode, Uri};
use axum::response::{IntoResponse, Response};
use rust_embed::RustEmbed;
use std::path::PathBuf;

#[derive(RustEmbed)]
#[folder = "../frontend/dist/frontend/browser"]
struct Assets;

pub async fn handler(uri: Uri) -> Response {
    let path = uri.path().trim_start_matches('/');

    if path.is_empty() || path == "index.html" {
        return FileResponse::from_assets("index.html")
            .ok_or_else(|| ApiError::FileNotFound)
            .into_response();
    }

    match FileResponse::from_assets(path) {
        Some(file) => file.into_response(),
        None => FileResponse::from_assets("index.html")
            .ok_or_else(|| ApiError::FileNotFound)
            .into_response(),
    }
}

struct FileResponse {
    data: Vec<u8>,
    path: PathBuf,
}

impl FileResponse {
    fn from_assets(path: &str) -> Option<Self> {
        Assets::get(path).map(|content| Self {
            data: content.data.to_vec(),
            path: PathBuf::from(path),
        })
    }
}

impl IntoResponse for FileResponse {
    fn into_response(self) -> Response {
        let mime = mime_guess::from_path(&self.path).first_or_octet_stream();
        Response::builder()
            .status(StatusCode::OK)
            .header(header::CONTENT_TYPE, mime.as_ref())
            .body(Body::from(self.data))
            .unwrap()
    }
}
