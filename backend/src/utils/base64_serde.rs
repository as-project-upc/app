use base64::{engine::general_purpose, Engine as _};
use serde::{Deserialize, Deserializer, Serializer};

pub fn serialize<S>(bytes: &[u8], serializer: S) -> Result<S::Ok, S::Error>
where
    S: Serializer,
{
    serializer.serialize_str(&general_purpose::URL_SAFE_NO_PAD.encode(bytes))
}

pub fn deserialize<'de, D>(deserializer: D) -> Result<Vec<u8>, D::Error>
where
    D: Deserializer<'de>,
{
    let s = String::deserialize(deserializer)?;
    general_purpose::URL_SAFE_NO_PAD
        .decode(s)
        .map_err(serde::de::Error::custom)
}
