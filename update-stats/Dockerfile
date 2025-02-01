FROM rust:latest AS builder

RUN rustup target add x86_64-unknown-linux-musl
RUN apt update && apt install -y musl-tools musl-dev
RUN yes | apt install gcc-x86-64-linux-gnu

WORKDIR /app

COPY . .

ENV RUSTFLAGS='-C linker=x86_64-linux-gnu-gcc'

RUN cargo build --target x86_64-unknown-linux-musl --release

FROM debian:bookworm-slim

WORKDIR /app

# Copy the compiled binary from the builder stage
COPY --from=builder /app/target/x86_64-unknown-linux-musl/release/update-stats /app/update-stats

CMD ["/app/update-stats"]