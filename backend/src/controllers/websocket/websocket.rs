use axum::{
    extract::ws::{Message, WebSocket, WebSocketUpgrade},
    response::IntoResponse,
};

use axum::extract::connect_info::ConnectInfo;
use futures_util::stream::{SplitSink, StreamExt};
use std::net::SocketAddr;
use tracing::{error, trace};

pub async fn handler(
    ws: WebSocketUpgrade,
    ConnectInfo(addr): ConnectInfo<SocketAddr>,
) -> impl IntoResponse {
    trace!("{addr} connected.");
    ws.on_upgrade(move |socket| handle_socket(socket, addr))
}

async fn handle_socket(socket: WebSocket, who: SocketAddr) {
    let (mut sender, mut receiver) = socket.split();
    tokio::spawn(async move {
        while let Some(Ok(msg)) = receiver.next().await {
            match msg {
                Message::Text(t) => {
                    match WebSocketMessage::try_from(t.as_str()) {
                        Ok(msg) => {
                            trace!(">>> {who} sent valid message: {msg:?}");
                        }
                        Err(_) => {
                            error!(">>> {who} sent invalid message: {t:?}");
                            break;
                        }
                    }
                    trace!(">>> {who} sent str: {t:?}");
                }
                Message::Close(c) => {
                    trace!(">>> {who} sent close: {c:?}");
                    break;
                }
                _ => trace!(">>> {who} sent other message: {msg:?}"),
            }
        }
    });
}

async fn process_message(msg: WebSocketMessage, sender: SplitSink<WebSocket, Message>) {
    match msg {
        WebSocketMessage::Auth => {}
        WebSocketMessage::SendTo => {}
    }
}

#[derive(Debug)]
enum WebSocketMessage {
    Auth,
    SendTo,
}

impl TryFrom<&str> for WebSocketMessage {
    type Error = ();

    fn try_from(msg: &str) -> Result<Self, Self::Error> {
        Ok(match msg {
            "auth" => WebSocketMessage::Auth,
            _ => return Err(()),
        })
    }
}
