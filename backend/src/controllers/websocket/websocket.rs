use axum::{
    extract::ws::{Message, WebSocket, WebSocketUpgrade},
    extract::State,
    response::IntoResponse,
};

use crate::utils::jwt::validate_token;
use crate::utils::Claims;
use axum::extract::connect_info::ConnectInfo;
use futures_util::stream::{SplitSink, StreamExt};
use futures_util::SinkExt;
use log::{error, info};
use serde::{Deserialize, Serialize};
use serde_json::json;
use std::collections::HashMap;
use std::net::SocketAddr;
use std::sync::Arc;
use tokio::sync::RwLock;

type SenderType = Arc<RwLock<SplitSink<WebSocket, Message>>>;
type Connections = Arc<RwLock<HashMap<String, SenderType>>>;

#[derive(Clone)]
pub struct WsState {
    pub connections: Connections,
}

impl WsState {
    pub fn new() -> Self {
        Self {
            connections: Arc::new(RwLock::new(HashMap::new())),
        }
    }
}

pub async fn handler(
    ws: WebSocketUpgrade,
    ConnectInfo(addr): ConnectInfo<SocketAddr>,
    State(state): State<WsState>,
) -> impl IntoResponse {
    info!("{addr} connected.");
    ws.on_upgrade(move |socket| handle_socket(socket, addr, state))
}

async fn handle_socket(socket: WebSocket, who: SocketAddr, state: WsState) {
    let (sender, mut receiver) = socket.split();
    let sender: SenderType = Arc::new(RwLock::new(sender));
    let mut claims: Option<Claims> = None;
    while let Some(Ok(msg)) = receiver.next().await {
        match msg {
            Message::Text(bytes) => {
                info!("{who}: Received message: {bytes:?}");
                match serde_json::from_str::<Payload>(bytes.as_str()) {
                    Ok(p) => match validate_token(&p.token) {
                        Ok(c) => {
                            handle_message(c.clone(), p, &sender, &state).await;
                            claims = Some(c);
                        }
                        Err(err) => {
                            error!("{who}: Invalid token: {err:?}");
                            continue;
                        }
                    },
                    Err(err) => {
                        error!("{who}: Failed to parse message payload: {err:?}");
                        continue;
                    }
                };
            }
            Message::Close(_) => {
                info!(">>> {who} disconnected.");
                if let Some(c) = &claims {
                    state.connections.write().await.remove(&c.sub);
                }
                break;
            }
            _ => info!(">>> {who} sent other message: {msg:?}"),
        }
    }

    if let Some(c) = &claims {
        state.connections.write().await.remove(&c.sub);
    }
}

async fn handle_message(claims: Claims, payload: Payload, sender: &SenderType, state: &WsState) {
    let user_id = &claims.sub;
    match payload.action {
        WebSocketMessage::SendMessage => {
            let to_user_id = payload
                .data
                .as_ref()
                .unwrap()
                .get("toUserId")
                .and_then(|v| v.as_str())
                .unwrap();

            let message = payload.data.as_ref().unwrap().get("message").unwrap();

            if let Some(target_sender) = state.connections.read().await.get(to_user_id) {
                send_message(
                    target_sender,
                    json!({
                        "action": "ReceiveMessage",
                        "data":{
                            "fromUserId": user_id,
                            "message": message,
                        },
                    }),
                )
                .await;
            } else {
                info!("User {to_user_id} is not connected. Cannot send message.");
            }
        }
        WebSocketMessage::SubscribeUser => {
            info!("User {user_id} subscribed for messages.");
            state
                .connections
                .write()
                .await
                .insert(user_id.clone(), sender.clone());
        }
        WebSocketMessage::UnsubscribeUser => {
            info!("User {user_id} unsubscribed from messages.");
            state.connections.write().await.remove(user_id);
        }
    }
}

async fn send_message(sender: &SenderType, data: serde_json::Value) {
    let msg_str = serde_json::to_string(&data).unwrap();
    sender
        .write()
        .await
        .send(Message::Text(msg_str.into()))
        .await
        .unwrap();
}

#[derive(Debug, Serialize, Deserialize)]
enum WebSocketMessage {
    SendMessage,
    SubscribeUser,
    UnsubscribeUser,
}

#[derive(Debug, Serialize, Deserialize)]
struct Payload {
    action: WebSocketMessage,
    data: Option<serde_json::Value>,
    token: String,
}
