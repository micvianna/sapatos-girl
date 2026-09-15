#!/usr/bin/env bash
set -euo pipefail

CACHE_ROOT="${TRIVY_CACHE_ROOT:?TRIVY_CACHE_ROOT is required}"
LIMIT_BYTES="${TRIVY_CACHE_LIMIT_BYTES:-3221225472}"
DRY_RUN="${DRY_RUN:-true}"
CLEANER_IMAGE="${TRIVY_CLEANER_IMAGE:-alpine:3.21}"
CACHE_VOLUME="${TRIVY_CACHE_VOLUME:-jenkins_home}"

CACHE_NAMES=(
    ".trivy-image-cache"
    ".trivy-app-image-cache"
    ".trivy-cache"
)

fail() {
    printf 'ERRO: %s\n' "$1" >&2
    exit 1
}

[[ "$CACHE_ROOT" == /var/jenkins_home/workspace/* ]] \
    || fail 'TRIVY_CACHE_ROOT must be inside /var/jenkins_home/workspace'

[[ "$LIMIT_BYTES" =~ ^[0-9]+$ ]] \
    || fail 'TRIVY_CACHE_LIMIT_BYTES must be an integer'

[[ "$DRY_RUN" == "true" || "$DRY_RUN" == "false" ]] \
    || fail 'DRY_RUN must be true or false'

[[ "$CACHE_VOLUME" =~ ^[A-Za-z0-9][A-Za-z0-9_.-]*$ ]] \
    || fail 'TRIVY_CACHE_VOLUME has an invalid name'

docker info >/dev/null

cache_size_bytes() {
    local cache_name="$1"

    docker run --rm \
        -e "CACHE_ROOT=$CACHE_ROOT" \
        -v "${CACHE_VOLUME}:/var/jenkins_home:ro" \
        "$CLEANER_IMAGE" \
        sh -ceu '
            cache_name="$1"
            cache_path="${CACHE_ROOT}/$cache_name"

            if [ ! -e "$cache_path" ]; then
                echo 0
                exit 0
            fi

            [ ! -L "$cache_path" ] || exit 74
            [ -d "$cache_path" ] || exit 75

            du -sk "$cache_path" | awk "{ print \$1 * 1024 }"
        ' sh "$cache_name"
}

remove_cache() {
    local cache_name="$1"

    docker run --rm \
        -e "CACHE_ROOT=$CACHE_ROOT" \
        -v "${CACHE_VOLUME}:/var/jenkins_home" \
        "$CLEANER_IMAGE" \
        sh -ceu '
            cache_name="$1"
            cache_path="${CACHE_ROOT}/$cache_name"

            [ ! -e "$cache_path" ] && exit 0
            [ ! -L "$cache_path" ] || exit 74
            [ -d "$cache_path" ] || exit 75

            rm -rf "$cache_path"
        ' sh "$cache_name"
}

total_bytes=0

for cache_name in "${CACHE_NAMES[@]}"; do
    cache_bytes="$(cache_size_bytes "$cache_name")"
    total_bytes=$((total_bytes + cache_bytes))
    printf '%s: %s bytes\n' "$cache_name" "$cache_bytes"
done

printf 'Total Trivy cache: %s bytes\n' "$total_bytes"
printf 'Threshold: %s bytes\n' "$LIMIT_BYTES"

if (( total_bytes <= LIMIT_BYTES )); then
    printf 'No cleanup required.\n'
    exit 0
fi

printf 'Threshold exceeded.\n'

for cache_name in "${CACHE_NAMES[@]}"; do
    cache_bytes="$(cache_size_bytes "$cache_name")"

    (( total_bytes > LIMIT_BYTES )) || break
    (( cache_bytes > 0 )) || continue

    if [[ "$DRY_RUN" == "true" ]]; then
        printf 'DRY RUN: would remove %s (%s bytes)\n' \
            "$cache_name" "$cache_bytes"
    else
        printf 'Removing %s (%s bytes)\n' "$cache_name" "$cache_bytes"
        remove_cache "$cache_name"
    fi

    total_bytes=$((total_bytes - cache_bytes))
done