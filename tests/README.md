# Suíte automatizada de QA

Esta suíte valida os contratos reais da API, a persistência no PostgreSQL e os principais fluxos da interface. Os testes usam dados únicos e não dependem de uma ordem de execução.

## Estrutura

```text
tests/
├── api/             # contratos HTTP, autenticação e segurança básica
├── integration/     # confirmação direta da persistência no PostgreSQL
├── conftest.py      # clientes, usuários, token, produto e carrinho
├── pytest.ini       # configuração e marcadores
└── requirements.txt # dependências Python

frontend/cypress/
├── e2e/             # autenticação, compra e idiomas
└── support/         # comandos reutilizáveis
```

## Pré-requisitos

- Python 3.10 ou superior;
- Node.js 18 ou superior e npm;
- PostgreSQL 12 ou superior;
- Chrome/Chromium ou Electron fornecido pelo Cypress;
- Docker com Compose é opcional, mas facilita criar o banco descartável.

Instale as dependências:

```bash
python3 -m venv .venv-qa
. .venv-qa/bin/activate
python -m pip install -r tests/requirements.txt
npm ci
npm --prefix backend ci
npm --prefix frontend ci
```

## Variáveis de ambiente

| Variável | Uso | Padrão local |
|---|---|---|
| `API_BASE_URL` | URL externa usada pelo Pytest | `http://localhost:5000` |
| `FRONTEND_BASE_URL` | URL aberta pelo Cypress | `http://localhost:3000` |
| `CYPRESS_API_BASE_URL` | URL da API usada pelos comandos Cypress | `http://localhost:5000` |
| `DB_HOST` | Host PostgreSQL | `localhost` |
| `DB_PORT` | Porta PostgreSQL | `5432` |
| `DB_NAME` | Banco da aplicação | `sapatos_ecommerce` |
| `DB_USER` | Usuário PostgreSQL | `postgres` |
| `DB_PASSWORD` | Senha PostgreSQL | sem padrão nos testes |
| `JWT_SECRET` | Assinatura e validação dos JWTs | obrigatória, sem valor padrão |
| `JWT_EXPIRE` | Validade dos JWTs | `7d` |
| `CORS_ORIGIN` | Origem permitida pelo backend | `http://localhost:3000` |
| `REACT_APP_API_URL` | URL compilada no frontend | `http://localhost:5000` |

Não use credenciais de produção. Para iniciar um PostgreSQL descartável, defina uma senha exclusiva de teste e execute:

```bash
export DB_PASSWORD='uma-senha-apenas-para-testes'
docker compose -f docker-compose.test.yml up -d --wait
```

O `database/schema.sql` cria automaticamente os dez produtos usados como seed em bancos novos. O `docker-compose.test.yml` sempre parte de um volume temporário, evitando dependência de dados inseridos manualmente.

Em outros terminais, inicie o backend e o frontend com as mesmas variáveis do banco:

```bash
npm --prefix backend start
```

```bash
REACT_APP_API_URL=http://localhost:5000 npm --prefix frontend start
```

## Execução

API:

```bash
python -m pytest -c tests/pytest.ini tests/api -v \
  --junitxml=reports/api-tests.xml
```

Integração:

```bash
python -m pytest -c tests/pytest.ini tests/integration -m integration -v \
  --junitxml=reports/integration-tests.xml
```

E2E headless:

```bash
CYPRESS_API_BASE_URL=http://localhost:5000 \
FRONTEND_BASE_URL=http://localhost:3000 \
npm run test:e2e
```

Se o agente exportar `ELECTRON_RUN_AS_NODE`, remova a variável apenas para essa execução com `env -u ELECTRON_RUN_AS_NODE npm run test:e2e`, como já faz o `Jenkinsfile`.

Os atalhos equivalentes na raiz são `npm run test:api`, `npm run test:integration` e `npm run test:e2e`. Para executar tudo, mantenha os três serviços ativos e rode os três comandos em sequência. Use `docker compose -f docker-compose.test.yml down` ao terminar.

## Jenkins

O `Jenkinsfile` instala dependências reproduzíveis com `npm ci`, cria um ambiente virtual Python, inicia um PostgreSQL descartável, sobe backend e frontend, verifica os dois serviços e executa separadamente API, integração e E2E. Configure `DB_PASSWORD` e `JWT_SECRET` como variáveis secretas do job; nenhum identificador de credencial específico de uma instalação foi fixado no arquivo. Os XML JUnit são publicados mesmo quando uma etapa falha; logs e screenshots também são arquivados. O banco e os processos locais são encerrados no bloco `post`.
