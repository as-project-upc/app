# app

# Technologies used

- Typescript
- Npm
- Angular
- Rust
- Axum
- SQLx
- Websockets

# Ideas for the app

- Veterinary animal management
- Client management
- User authentication
- Owners info
    - Info about the animals
- Medical history
- Appointments
- Billing
- Inventory
- Reports

# Security Features

- User authentication and author  ization
- User roles and permissions
- Data validation and sanitization
- Password protection
- Database encryption
- Content encryption
- SQL injection prevention
- Server certificates
- CSRF protection
- XSS protection

# Setup

- Install npm
    - https://nodejs.org/en/download
- Install rust
    - https://rust-lang.org/tools/install/
- Install toolchain
    - Download https://www.msys2.org/ and install
    - Open `C:\msys64\ucrt64.exe` and run `pacman -S mingw-w64-ucrt-x86_64-toolchain`
    - `rustup default stable-x86_64-pc-windows-gnu`

# Run the app

## Frontend

- `npm install`
- `npm start`

## Backend

- `cargo run`