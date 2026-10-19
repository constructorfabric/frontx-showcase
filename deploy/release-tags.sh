#!/bin/sh
# Checks a release tag and prints the image tags it publishes, one per line. Usage: deploy/release-tags.sh <tag> <commit sha>, in a clone that has origin/main and the tags.
# It fails unless the tag is a plain vX.Y.Z on a commit of origin/main. The image gets X.Y.Z and the sha always, X.Y when the tag is the highest patch of its line and latest when it is the highest release; only the vX.Y.Z tags on origin/main count, so a stray tag elsewhere holds nothing back, and a late patch to an older line or a re-run of an older release moves neither X.Y nor latest back.
set -eu
tag="$1"
sha="$2"
release='^(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)$'
version="${tag#v}"
if [ "$tag" = "$version" ] || ! printf '%s\n' "$version" | grep -Eq "$release" || [ "$(printf '%s\n' "$tag" | wc -l)" -ne 1 ]; then
  echo "$tag is not a release version vX.Y.Z" >&2; exit 1
fi
# A shallow clone cannot tell a commit off main from history it does not hold.
if [ "$(git rev-parse --is-shallow-repository)" = true ]; then
  echo "cannot check $sha against origin/main: the clone is shallow; it needs full history" >&2; exit 1
fi
# merge-base exits 1 when the commit is not on main and above 1 when git cannot answer (no origin/main, an unknown sha).
status=0
git merge-base --is-ancestor "$sha" origin/main || status=$?
if [ "$status" -eq 1 ]; then
  echo "$tag points at $sha, which is not on main" >&2; exit 1
elif [ "$status" -ne 0 ]; then
  echo "cannot check $sha against origin/main (git exit $status): the sha or origin/main is not in this clone" >&2; exit 1
fi
releases="$(git tag --merged origin/main --list 'v*.*.*' | sed 's/^v//' | grep -E "$release" | sort -V)"
line="${version%.*}"
printf '%s\n%s\n' "$version" "$sha"
if [ "$(printf '%s\n' "$releases" | awk -v p="$line." 'index($0, p) == 1' | tail -n 1)" = "$version" ]; then echo "$line"; fi
if [ "$(printf '%s\n' "$releases" | tail -n 1)" = "$version" ]; then echo latest; fi
