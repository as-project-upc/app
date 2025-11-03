use opaque_ke::CipherSuite;
use opaque_ke::{ServerLogin, ServerSetup};
use rand::rngs::OsRng;
use std::collections::HashMap;
use std::fs;
use std::path::Path;
use std::sync::{Arc, Mutex};

#[derive(Clone, Copy, Debug)]
pub struct DefaultCipherSuite;

impl CipherSuite for DefaultCipherSuite {
    type OprfCs = opaque_ke::Ristretto255;
    type KeyExchange =
        opaque_ke::key_exchange::tripledh::TripleDh<opaque_ke::Ristretto255, sha2::Sha512>;
    type Ksf = opaque_ke::ksf::Identity;
}

#[derive(Clone)]
pub struct OpaqueServer {
    pub server_setup: ServerSetup<DefaultCipherSuite>,
    pub login_state_cache: Arc<Mutex<HashMap<String, ServerLogin<DefaultCipherSuite>>>>,
}

impl OpaqueServer {
    pub fn new(path: &str) -> Self {
        if Path::new(path).exists() {
            let bytes = fs::read(path).expect("Failed to read server setup file");
            Self {
                server_setup: ServerSetup::<DefaultCipherSuite>::deserialize(&bytes)
                    .expect("Failed to deserialize server setup"),
                login_state_cache: Arc::new(Mutex::new(HashMap::new())),
            }
        } else {
            let mut rng = OsRng;
            let opaque_server = Self {
                server_setup: ServerSetup::<DefaultCipherSuite>::new(&mut rng),
                login_state_cache: Arc::new(Mutex::new(HashMap::new())),
            };
            let serialized = opaque_server.server_setup.serialize();
            fs::write(path, serialized).expect("Failed to write server setup file");
            opaque_server
        }
    }
}
