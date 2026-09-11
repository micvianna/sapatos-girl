#!/usr/bin/env bash
set -euo pipefail

usage() {
    printf 'Uso: %s <sha-completo-aprovado>\n' "$0" >&2
}

fail() {
    printf 'ERRO: %s\n' "$1" >&2
    exit 1
}

if [[ "$#" -ne 1 ]]; then
    usage
    exit 2
fi

APPROVED_SHA="$1"
if [[ ! "$APPROVED_SHA" =~ ^[0-9a-fA-F]{40}$ ]]; then
    usage
    fail 'o SHA deve conter exatamente 40 caracteres hexadecimais'
fi

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)
REPO_ROOT="$(cd -- "$SCRIPT_DIR/.." && pwd)
DEPLOY_DIR="$REPO_ROOT/deploy"
ENV_FILE="$DEPLOY_DIR/.env.lab"
COMPOSE_FILE="$DEPLOY_DIR/docker-compose.lab.yml"

cd "$REPO_ROOT"

[[ -d "$REPO_ROOT/.git" || -f "$REPO_ROOT/.git" ]] || fail "raiz Git nao encontrada: $REPO_ROOT"
[[ -f "$ENV_FILE" ]] || fail "arquivo obrigatorio ausente: deploy/.env.lab"
[[ -f "$COMPOSE_FILE" ]] || fail "arquivo Compose ausente: deploy/docker-compose.lab.yml"

if [[ -n "$(git status --porcelain)" ]]; then
    fail 'working tree possui alteracoes; execute o deploy em um clone limpo'
fi

printf 'Buscando origin/main...\n'
git fetch --quiet origin main

if ! git cat-file -e "$APPROVED_SHA^{commit}" 2>/dev/null; then
    fail "SHA nao existe como commit: $APPROVED_SHA"
fi

if ! git cat-file -e "$APPROVED_SHA:scripts/deploy-lab.sh" 2>/dev/null; then
    fail "SHA nao contem scripts/deploy-lab.sh: $APPROVED_SHA"
fi

if ! git merge-base --is-ancestor "$APPROVED_SHA" origin/main; then
    fail "SHA nao pertence a origin/main: $APPROVED_SHA"
fi

printf 'Posicionando o clone no SHA aprovado...\n'
git checkout --detach "$APPROVED_SHA"

[[ -f "$ENV_FILE" ]] || fail "deploy/.env.lab nao existe no checkout selecionado"
[[ -f "$COMPOSE_FILE" ]] || fail "docker-compose.lab.yml nao existe no checkout selecionado"

printf 'Validando a configuracao do Compose...\n'
docker compose --env-file deploy/.env.lab -f deploy/docker-compose.lab.yml config >/dev/null

printf 'Executando o Compose do laboratorio...\n'
docker compose --env-file deploy/.env.lab -f deploy/docker-compose.lab.yml up -d --build

COMPOSE_ARGS=(--env-file deploy/.env.lab -f deploy/docker-compose.lab.yml)
TIMEOUT_SECONDS=180
POLL_SECONDS=3

check_postgres() {
    docker compose "${COMPOSE_ARGS[@]}" exec -T postgres \
        sh -c 'pg_isready -U "$POSTGRES_USER" -d "$POSTGRES_DB"' >/dev/null 2>&1
}

check_http() {
    local url="$1"
    curl -fsS --max-time 10 -o /dev/null "$url" >/dev/null 2>&1
}

wait_for_check() {
    local description="$1"
    shift
    local deadline=$((SECONDS + TIMEOUT_SECONDS))

    while (( SECONDS < deadline )); do
        if "$@"; then
            printf '%s: OK\n' "$description"
            return 0
        fi
        sleep "$POLL_SECONDS"
    done

    fail "$description nao ficou saudavel em ${TIMEOUT_SECONDS}s"
}

wait_for_check 'PostgreSQL' check_postgres
wait_for_check 'Frontend local' check_http http://127.0.0.1:3001/
wait_for_check 'Backend local' check_http http://127.0.0.1:5001/api/health
wait_for_check 'Frontend publico' check_http https://lab-sapatos.bhrtech.com.br/
wait_for_check 'Backend publico' check_http https://lab-sapatos.bhrtech.com.br/api/health

printf '\nSHA implantado: %s\n' "$(git rev-parse HEAD)"
printf 'Status dos servicos:\n'
docker compose "${COMPOSE_ARGS[@]}" ps
printf 'Smoke tests locais e publicos: OK\n'
