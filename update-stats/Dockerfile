FROM rust:latest AS builder

WORKDIR /usr/src/app
COPY Cargo.toml Cargo.lock ./
COPY src ./src

RUN apt-get update && apt-get install -y musl-tools
RUN rustup target add aarch64-unknown-linux-musl
RUN cargo build --release --target=aarch64-unknown-linux-musl

FROM debian:bullseye-slim

WORKDIR /app
COPY --from=builder /usr/src/app/target/aarch64-unknown-linux-musl/release/update-stats .

CMD ["/app/update-stats"]