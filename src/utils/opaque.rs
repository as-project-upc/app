use crate::repository::server_data::ServerDataRepository;
use opaque_ke::CipherSuite;
use opaque_ke::{ServerLogin, ServerSetup};
use rand::rngs::OsRng;
use sqlx::SqlitePool;
use std::collections::HashMap;
use std::sync::{Arc, Mutex};

#[derive(Clone, Copy, Debug)]
pub struct DefaultCipherSuite;

type Server = ServerSetup<DefaultCipherSuite>;

impl CipherSuite for DefaultCipherSuite {
    type OprfCs = opaque_ke::Ristretto255;
    type KeyExchange =
        opaque_ke::key_exchange::tripledh::TripleDh<opaque_ke::Ristretto255, sha2::Sha512>;
    type Ksf = opaque_ke::ksf::Identity;
}

#[derive(Clone)]
pub struct OpaqueServer {
    pub server_setup: Server,
    pub login_state_cache: Arc<Mutex<HashMap<String, ServerLogin<DefaultCipherSuite>>>>,
}

impl OpaqueServer {
    pub async fn new(pool: SqlitePool) -> Self {
        let repo = ServerDataRepository::new(pool);

        let server = match repo.get_opaque_key().await {
            Ok(bytes) => Server::deserialize(&bytes).unwrap(),
            Err(_) => {
                let server = Server::new(&mut OsRng);
                repo.set_opaque_key(server.serialize().to_vec())
                    .await
                    .unwrap();
                server
            }
        };

        Self {
            server_setup: server,
            login_state_cache: Arc::new(Mutex::new(HashMap::new())),
        }
    }
}
