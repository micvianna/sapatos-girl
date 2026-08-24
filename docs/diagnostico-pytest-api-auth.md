# Diagnóstico e correção dos testes de autenticação da API

Data da investigação: 23 de agosto de 2026  
Projeto analisado: `testes_atalaia` / `sapatos-girl`  
Branch local: `style/harmonize-design-and-fixes`

## Objetivo

Investigar por que os testes abaixo recebiam HTTP `500` ao chamar `POST /api/auth/register`:

```text
tests/api/test_auth.py::test_register_user_success
tests/api/test_auth.py::test_register_user_failure_existing_email
```

Os asserts esperavam, respectivamente, HTTP `201` para um cadastro válido e HTTP `400` para um e-mail inválido.

## Resultado final

Após as correções, a execução real apresentou:

```text
tests/api/test_auth.py::test_register_user_success PASSED
tests/api/test_auth.py::test_register_user_failure_invalid_email PASSED

2 passed in 0.16s
```

Comando utilizado:

```bash
.venv/bin/python -m pytest tests/api -v
```

## Causas encontradas

### 1. PostgreSQL indisponível

No início da investigação não havia serviço ouvindo em `localhost:5432`:

```text
localhost:5432 - no response
```

A exceção capturada diretamente no backend foi:

```text
[auth/register] connect ECONNREFUSED 127.0.0.1:5432
```

O PostgreSQL usado nos testes era o container:

```text
sapatos-girl-postgres-test-1
```

Ele estava parado com status `Exited (0)`. O container foi iniciado e ficou saudável, expondo a porta `5432` no host.

### 2. Divergência entre o schema do banco e o código do backend

Depois que a conexão foi restabelecida, a tabela real `usuarios` tinha somente estas colunas:

```text
id
nome
email
senha
telefone
data_criacao
data_atualizacao
```

Entretanto, a rota executava:

```sql
SELECT *
FROM usuarios
WHERE email = $1
  AND deleted_at IS NULL;
```

O PostgreSQL retornava:

```text
column "deleted_at" does not exist
SQLSTATE 42703
```

O container de banco havia sido criado por outro checkout do repositório:

```text
/home/michel/Documents/ReposGit/sapatos-girl
```

O `database/schema.sql` daquele checkout não continha `is_admin` nem `deleted_at`. Já o schema da branch atual em `testes_atalaia` contém essas colunas. Portanto, o backend e o banco estavam sendo executados a partir de versões diferentes do projeto.

O banco de teste em execução foi alinhado com:

```sql
ALTER TABLE usuarios
ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;

ALTER TABLE usuarios
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP DEFAULT NULL;
```

Importante: essa alteração corrigiu o container atual. Caso ele seja removido e recriado usando o schema antigo do outro checkout, a incompatibilidade retornará. O ambiente Docker/Jenkins deve criar o banco usando o `database/schema.sql` da mesma revisão usada pelo backend.

### 3. Validação de e-mail ausente na implementação executada

O teste de e-mail inválido esperava:

```json
{"error": "Email inválido"}
```

Porém, a rota apenas verificava se `nome`, `email` e `senha` estavam preenchidos. Ela consultava o banco antes de validar o formato do e-mail.

Foi adicionado em `backend/src/routes/auth.js`:

```javascript
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
```

E, antes da primeira consulta ao banco:

```javascript
if (!EMAIL_PATTERN.test(email)) {
  return res.status(400).json({ error: 'Email inválido' });
}
```

Assim, entradas inválidas retornam HTTP `400` sem depender do PostgreSQL.

### 4. Nome incorreto do segundo teste

O teste chamava-se:

```python
test_register_user_failure_existing_email
```

Mas enviava o valor `email-invalido`; ele não testava duplicidade. O nome foi corrigido para:

```python
test_register_user_failure_invalid_email
```

Os asserts e o comportamento esperado não foram flexibilizados.

## Validação do serviço na porta 5000

Foi confirmado que a porta `5000` pertence ao backend correto:

```text
Processo: node
Comando: node src/server.js
Diretório: /home/michel/Documents/testes_atalaia/backend
```

Não era um processo de outro projeto nem um backend executado em container.

A montagem da rota também foi confirmada:

```javascript
app.use('/api/auth', authRoutes);
```

Somada a `router.post('/register', ...)`, a rota efetiva é:

```text
POST /api/auth/register
```

O valor padrão presente em `tests/api/conftest.py` está correto:

```python
http://localhost:5000/api
```

## Variáveis de ambiente verificadas

Nenhum valor secreto foi registrado neste documento.

```text
PORT: definido
DB_HOST: definido
DB_PORT: definido
DB_NAME: definido
DB_USER: definido
DB_PASSWORD: definido
DATABASE_URL: ausente
JWT_SECRET: definido
JWT_EXPIRE: definido
```

`DATABASE_URL` não é usado pela implementação atual. O pool é configurado pelas variáveis `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER` e `DB_PASSWORD`.

A conexão confirmada foi com:

```text
Host solicitado pelo backend: localhost
Porta: 5432
Database: sapatos_ecommerce
Usuário: postgres
Servidor real: PostgreSQL no container sapatos-girl-postgres-test-1
```

## Diferença entre ambiente local e Jenkins/Docker

No ambiente local:

- o backend é um processo Node executado diretamente no host;
- os testes chamam `http://localhost:5000/api`;
- o PostgreSQL é fornecido por um container na porta `5432`;
- o container encontrado foi criado a partir do checkout `/home/michel/Documents/ReposGit/sapatos-girl`.

Na configuração Jenkins encontrada no outro checkout:

- o PostgreSQL é iniciado com `docker-compose.test.yml`;
- o backend continua sendo iniciado no host do agente Jenkins;
- `DB_HOST=localhost` e `DB_PORT=5432`;
- a API é verificada em `http://localhost:5000/api/health`;
- o banco é temporário e recriado a partir de `database/schema.sql`.

Consequentemente, o Jenkins só será consistente se o `Jenkinsfile`, o backend e o `database/schema.sql` vierem do mesmo commit/branch. Misturar o backend desta branch com o schema antigo reproduz o erro de `deleted_at`.

Os containers chamados `atalaia-*` encontrados durante a investigação usam outras portas e redes. Eles não atendem `localhost:5000` e não foram a origem deste erro.

## Respostas HTTP verificadas após a correção

E-mail inválido:

```text
HTTP/1.1 400 Bad Request
{"error":"Email inválido"}
```

Cadastro válido:

```text
HTTP/1.1 201 Created
{"message":"Usuário criado com sucesso", ...}
```

## Arquivos alterados

### `backend/src/routes/auth.js`

- adicionada a constante `EMAIL_PATTERN`;
- adicionada validação de formato antes da consulta ao banco.

### `tests/api/test_auth.py`

- renomeado o cenário de `existing_email` para `invalid_email`;
- asserts originais preservados.

### Banco de dados de teste

- adicionada `usuarios.is_admin` caso ausente;
- adicionada `usuarios.deleted_at` caso ausente;
- nenhum assert foi alterado para aceitar HTTP `500`.

## Como reproduzir a verificação

Confirmar os serviços:

```bash
ss -ltnp | grep :5000
pg_isready -h localhost -p 5432
docker ps --filter name=sapatos-girl-postgres-test-1
```

Caso o container de teste existente esteja parado:

```bash
docker start sapatos-girl-postgres-test-1
```

Testar o endpoint inválido:

```bash
curl -i -X POST http://localhost:5000/api/auth/register \
  -H 'Content-Type: application/json' \
  -d '{
    "nome": "QA Automation",
    "email": "email-invalido",
    "senha": "Teste@123"
  }'
```

Executar a suíte:

```bash
source .venv/bin/activate
pytest tests/api -v
```

Resultado esperado:

```text
2 passed
```

## Observação para continuidade por outra IA

Antes de recriar o container PostgreSQL, confirme qual checkout e qual `database/schema.sql` serão montados. O schema da branch atual já declara `is_admin` e `deleted_at`, enquanto o checkout que originou o container investigado estava desatualizado. A correção permanente do pipeline é impedir essa mistura de revisões e inicializar o banco a partir do mesmo commit utilizado para iniciar o backend.
