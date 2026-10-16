# The deploy webhook: Node and the Docker CLI with its compose plugin, driving the host's Docker through the mounted socket (deploy/docker-compose.yml). Socket access is root-equivalent on the host, so the process runs as root inside and the secret that unlocks it never leaves deploy/.env.
FROM alpine:3.24
RUN apk add --no-cache docker-cli docker-cli-compose nodejs
COPY server.mjs handler.mjs verify.mjs serialize.mjs /app/
CMD ["node", "/app/server.mjs"]
