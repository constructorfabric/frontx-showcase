#!/bin/sh
# Starts the site image as the compose file runs it (read-only, no capabilities, no new privileges) and checks that it turns healthy, serves the document and a plain-text twin, follows the cache policy and carries the origin it was built with. Usage: deploy/smoke.sh <image> <origin> [<host port>, 8080 by default]
set -eu
image="$1"
origin="$2"
port="${3:-8080}"
base="http://127.0.0.1:$port"
name="frontx-site-smoke-$$"
cleanup() {
  status=$?
  [ "$status" -eq 0 ] || docker logs "$name" 1>&2 || true
  docker rm -f "$name" >/dev/null 2>&1 || true
}
trap cleanup EXIT
# A cancelled run exits normally, so the container is removed then too.
trap 'exit 130' INT TERM
docker run -d --name "$name" --read-only --tmpfs /data:uid=10001,gid=10001 --tmpfs /config:uid=10001,gid=10001 \
  --cap-drop ALL --security-opt no-new-privileges -p "127.0.0.1:$port:8080" "$image" >/dev/null
for _ in $(seq 1 30); do
  [ "$(docker inspect -f '{{.State.Health.Status}}' "$name")" = healthy ] && break
  [ "$(docker inspect -f '{{.State.Running}}' "$name")" = true ] || { echo "smoke failed: the container stopped" >&2; exit 1; }
  sleep 2
done
[ "$(docker inspect -f '{{.State.Health.Status}}' "$name")" = healthy ] || { echo "smoke failed: the container did not turn healthy" >&2; exit 1; }

# The value of one response header of a path, whatever the status.
header() {
  curl -sS -o /dev/null -D - "$base$1" | tr -d '\r' | grep -i "^$2:" | head -n 1 | cut -d' ' -f2-
}
# The status of a path, 000 when no response came.
status() {
  curl -sS -o /dev/null -w '%{http_code}' "$base$1" || true
}
# Fails with a message naming the check when the actual value is not the expected one.
expect() {
  [ "$2" = "$3" ] || { echo "smoke failed: $1: got '$2', expected '$3'" >&2; exit 1; }
}
# Fails when an address the checks need could not be found.
found() {
  [ -n "$2" ] || { echo "smoke failed: no $1 found" >&2; exit 1; }
}

curl -fsS -o /dev/null "$base/" || { echo "smoke failed: the document does not answer" >&2; exit 1; }
curl -fsS -o /dev/null "$base/home/index.md" || { echo "smoke failed: the home twin does not answer" >&2; exit 1; }
expect 'twin content type' "$(header /home/index.md content-type)" 'text/plain; charset=utf-8'
curl -fsS "$base/robots.txt" | grep -qF "Sitemap: ${origin%/}/sitemap.xml" || { echo "smoke failed: robots.txt does not name ${origin%/}/sitemap.xml" >&2; exit 1; }
expect 'document cache' "$(header / cache-control)" 'no-cache'
expect 'aggregate cache' "$(header /generated-mfe-manifests.json cache-control)" 'no-cache'
asset="$(curl -fsS "$base/" | grep -o 'assets/[^"]*\.js' | head -n 1)"
found 'hashed host asset' "$asset"
expect "cache of /$asset" "$(header "/$asset" cache-control)" 'public, max-age=31536000, immutable'
expect 'missing file cache' "$(header /assets/missing.js cache-control)" 'no-store'
remote="$(curl -fsS "$base/generated-mfe-manifests.json" | grep -o 'mfe/[^/"]*/' | head -n 1)"
found 'remote in the aggregate' "$remote"
expect "cache of /${remote}remoteEntry.js" "$(header "/${remote}remoteEntry.js" cache-control)" 'no-cache'
expect "cache of /${remote}mf-manifest.json" "$(header "/${remote}mf-manifest.json" cache-control)" 'no-cache'
chunk="$(curl -fsS "$base/${remote}mf-manifest.json" | grep -o 'assets/[^"]*\.js' | head -n 1)"
found "hashed chunk of $remote" "$chunk"
expect "cache of /${remote}${chunk}" "$(header "/${remote}${chunk}" cache-control)" 'public, max-age=31536000, immutable'
expect 'nosniff' "$(header / x-content-type-options)" 'nosniff'
expect 'content security policy' "$(header / content-security-policy)" "base-uri 'self'; object-src 'none'; frame-ancestors 'self'"
expect 'document status' "$(status /)" '200'
expect 'missing file status' "$(status /assets/missing.js)" '404'
expect 'no Server header' "$(header / server)" ''
expect 'no Server header on a missing file' "$(header /assets/missing.js server)" ''
echo "smoke passed: $image ($origin)"
