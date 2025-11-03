CREATE TABLE IF NOT EXISTS users
(
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    username      TEXT     NOT NULL UNIQUE,
    password_file BLOB     NOT NULL,
    email         TEXT     NOT NULL UNIQUE,
    role          TEXT     NOT NULL DEFAULT 'user',
    created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_username ON users (username);
CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users (role);
