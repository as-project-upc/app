CREATE TABLE IF NOT EXISTS users
(
    id            TEXT     NOT NULL PRIMARY KEY,
    username      TEXT     NOT NULL UNIQUE,
    password_file BLOB     NOT NULL,
    email         TEXT     NOT NULL UNIQUE,
    role          TEXT     NOT NULL DEFAULT 'user',
    created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_username ON users (username);
CREATE INDEX IF NOT EXISTS idx_users_id ON users (id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users (role);


CREATE TABLE IF NOT EXISTS appointment
(
    appointment_id TEXT     NOT NULL PRIMARY KEY,
    user_id        TEXT     NOT NULL,
    date           DATETIME NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_appointments_user_id ON appointment (user_id, appointment_id);


CREATE TABLE IF NOT EXISTS server_data
(
    id   TEXT NOT NULL PRIMARY KEY,
    data BLOB NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_infrastructure_id ON server_data (id);