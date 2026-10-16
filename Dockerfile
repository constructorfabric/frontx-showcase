# The site as one container image: the build stage composes and builds site/dist from this checkout, and the run stage serves it with Caddy as a non-root user on port 8080 (PORT). SITE_ORIGIN is the address the site is served from, with its sub-path if any; it is baked into the sitemap, robots.txt, the canonical addresses and llms.txt, so each origin needs its own build:
#   docker build --build-arg SITE_ORIGIN=http://localhost:8080 -t frontx-site:local .

FROM node:24.21.0-alpine3.24 AS build
RUN npm install -g npm@10.9.4 \
 && test "$(npm --version)" = "10.9.4"
WORKDIR /app
COPY package.json package-lock.json .npmrc ./
RUN npm ci --no-audit --no-fund
# Declared after the tooling install, so builds for different origins share its layers.
ARG SITE_ORIGIN
RUN if [ -z "$SITE_ORIGIN" ]; then echo "SITE_ORIGIN is required: docker build --build-arg SITE_ORIGIN=https://<domain>[/<sub-path>] ." >&2; exit 1; fi
COPY . .
ENV SITE_ORIGIN=$SITE_ORIGIN
RUN npm run setup && npm run build

FROM caddy:2.11.7-alpine
# The caddy binary carries the capability to bind low ports, which a non-root process started with no-new-privileges cannot take, so the binary would not start; the site listens on a high port and needs none.
RUN apk add --no-cache --virtual .setcap libcap \
 && setcap -r /usr/bin/caddy \
 && apk del .setcap \
 && addgroup -S -g 10001 site \
 && adduser -S -D -H -u 10001 -G site site \
 && chown site:site /data /config
# The deploy webhook prunes replaced images by this label only.
LABEL org.opencontainers.image.title="frontx-site"
COPY deploy/site/Caddyfile /etc/caddy/Caddyfile
COPY --from=build /app/site/dist /srv
ENV PORT=8080
USER site
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --start-interval=2s --retries=3 \
  CMD wget -q --spider "http://127.0.0.1:${PORT}/" || exit 1
