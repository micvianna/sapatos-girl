# Diagnóstico e correção da pipeline Jenkins

Data: 25 de agosto de 2026
Projeto: `sapatos-girl`
Branch analisada: `main`

## Resumo executivo

A pipeline apresentava uma falha de API relacionada a CORS e falhas E2E causadas por divergência entre o frontend atual e testes Cypress escritos para uma interface anterior.

As causas raiz foram corrigidas sem remover cenários, aceitar erros HTTP indevidos ou adicionar esperas arbitrárias. Após as mudanças:

```text
Pytest API:         46 passed
Pytest Integration:  2 passed
Cypress E2E:          5 passed
Jest backend:        31 passed
Build React:          sucesso
```

Os relatórios JUnit XML, Pytest HTML e Mochawesome foram gerados e a configuração Jenkins passou a arquivá-los explicitamente.

## Diagnóstico: API e CORS

### Erro encontrado

O teste `test_json_and_cors_headers_are_present` enviava sempre:

```http
Origin: http://localhost:3000
```

Isso tornava o teste dependente do ambiente local. No ambiente Jenkins informado, o backend aceita:

```text
http://sapatos-frontend-test:3000
```

Como o Origin enviado não fazia parte da lista permitida, o middleware CORS não adicionava `Access-Control-Allow-Origin`.

### Causa raiz

O comportamento restritivo do backend estava correto. O defeito estava no contrato de configuração do teste: a origem esperada estava fixada no código em vez de vir do ambiente.

Além disso, o assert anterior verificava apenas a presença de algum valor:

```python
assert response.headers["Access-Control-Allow-Origin"]
```

Essa verificação era incompleta, pois não garantia que o backend devolveu exatamente o Origin autorizado.

### Correção

Foi criada a fixture `frontend_origin` em `tests/conftest.py`:

```python
@pytest.fixture(scope="session")
def frontend_origin():
    return os.getenv("FRONTEND_ORIGIN", "http://localhost:3000").rstrip("/")
```

Com isso:

- ambiente local usa `http://localhost:3000` por padrão;
- Jenkins define `FRONTEND_ORIGIN=http://sapatos-frontend-test:3000`;
- o teste envia o Origin correspondente ao ambiente;
- o assert compara o header com o valor exato esperado.

O Jenkins permite os dois origins necessários:

```text
CORS_ORIGIN=http://localhost:3000,http://sapatos-frontend-test:3000
```

Isso mantém compatibilidade com o frontend iniciado localmente pelo Jenkins e com o hostname usado na rede Docker, sem usar wildcard `*`.

## Diagnóstico: Cypress e frontend

### Botões de login e cadastro

Os testes procuravam:

```text
[data-testid="register-submit"]
[data-testid="login-submit"]
```

Os botões reais existiam, as rotas `/register` e `/login` estavam corretas e os formulários submetiam pelos handlers esperados. Somente os identificadores estáveis haviam sido removidos durante a evolução visual do frontend.

Foram restaurados os atributos `data-testid` nos botões reais. Nenhum comportamento funcional foi modificado.

### Outras divergências ocultas encontradas

Corrigir somente os dois botões não seria suficiente. A varredura encontrou:

1. O logout existe na página `/account`, mas o teste procurava o botão diretamente na home.
2. O teste de internacionalização esperava textos antigos da marca `ShoeStyle`, enquanto a interface atual é `ATALAIA`.
3. As opções de idioma só são renderizadas depois que o menu é aberto.
4. O teste de compra esperava exatamente `10 produtos encontrados`, mas a interface atual exibe a quantidade real seguida de `PEÇAS`.
5. O teste esperava um `alert` ao adicionar produto, mas o feedback funcional atual é a abertura do mini-carrinho.
6. O ícone de carrinho no header abre o mini-carrinho; ele não navega para `/cart`.
7. O teste usava seletores de quantidade da página de carrinho contra o componente de mini-carrinho.
8. O checkout exige o campo `numero`, mas o Cypress não o preenchia.
9. A confirmação do pedido é exibida em um toast na home, não em `window.alert`.
10. Uma primeira compra com cartão pode resultar em `PEDIDO EM ANÁLISE` pela regra antifraude, então exigir sempre o texto `Pedido Confirmado!` estava funcionalmente errado.

### Justificativa das mudanças nos testes

As assertions desatualizadas foram substituídas por evidências equivalentes ou mais fortes do comportamento atual:

- resposta HTTP da inclusão no carrinho igual a `200`;
- mini-carrinho visível e contendo o produto;
- quantidade atualizada após a resposta HTTP da API;
- item removido e estado vazio visível;
- navegação real para `/account` antes de validar logout;
- navegação real para `/checkout` pelo mini-carrinho;
- resposta HTTP da criação do pedido igual a `200`;
- retorno à home e toast de sucesso visível.

O teste de idioma agora verifica um texto realmente internacionalizado antes e depois da troca:

```text
FRETE GRÁTIS EM PEDIDOS ACIMA DE R$ 500
COMPLIMENTARY SHIPPING ON ORDERS OVER R$ 500
```

### Seletores estáveis adicionados

Foram adicionados identificadores aos elementos reais:

```text
register-submit
login-submit
login-link
account-link
logout-button
language-menu
language-en
announcement-text
product-card
products-count
add-to-cart
mini-cart
cart-item
cart-quantity
increment-cart-item
remove-cart-item
checkout-link
place-order
order-success
cart-toggle
```

O botão de inclusão rápida aparece por hover no desktop. Também foi adicionado suporte CSS a `:focus-within`, permitindo interação por teclado e um teste acessível sem `click({ force: true })`.

## Relatórios e Jenkins

### Pytest

Os comandos Jenkins agora geram simultaneamente JUnit e HTML autocontido:

```bash
.venv-qa/bin/python -m pytest -c tests/pytest.ini tests/api -v \
  --junitxml=reports/api-tests.xml \
  --html=reports/api-tests.html \
  --self-contained-html

.venv-qa/bin/python -m pytest -c tests/pytest.ini tests/integration -m integration -v \
  --junitxml=reports/integration-tests.xml \
  --html=reports/integration-tests.html \
  --self-contained-html
```

### Cypress

O Cypress continua usando `cypress-multi-reporters` com:

- saída no console;
- JUnit XML;
- Mochawesome JSON;
- Mochawesome HTML;
- screenshot em caso de falha.

### Arquivamento

O padrão anterior arquivava apenas logs e screenshots. Foi ampliado para incluir:

```text
reports/**/*.html
reports/**/*.json
reports/*.log
reports/*.xml
frontend/cypress/screenshots/**/*
```

O passo `junit` continua publicando `reports/*.xml`.

## Arquivos alterados

### Configuração e testes

- `Jenkinsfile`
- `tests/conftest.py`
- `tests/api/test_users.py`
- `frontend/cypress/e2e/auth.cy.js`
- `frontend/cypress/e2e/i18n.cy.js`
- `frontend/cypress/e2e/shopping.cy.js`

### Frontend

- `frontend/src/pages/Login.js`
- `frontend/src/pages/Register.js`
- `frontend/src/pages/Account.js`
- `frontend/src/pages/Checkout.js`
- `frontend/src/pages/Home.js`
- `frontend/src/pages/Products.js`
- `frontend/src/components/Header.js`
- `frontend/src/components/ProductCard.js`
- `frontend/src/components/ProductCard.css`
- `frontend/src/components/MiniCart.js`

## Comandos executados

Validação unitária do backend:

```bash
npm --prefix backend test -- --runInBand
```

Build do frontend:

```bash
npm --prefix frontend run build
```

Ambiente PostgreSQL descartável:

```bash
docker compose -p testes-atalaia -f docker-compose.test.yml up -d --wait
```

API:

```bash
FRONTEND_ORIGIN=http://sapatos-frontend-test:3000 \
.venv/bin/python -m pytest -c tests/pytest.ini tests/api -v \
  --junitxml=reports/api-tests.xml \
  --html=reports/api-tests.html \
  --self-contained-html
```

Integração:

```bash
.venv/bin/python -m pytest -c tests/pytest.ini tests/integration \
  -m integration -v \
  --junitxml=reports/integration-tests.xml \
  --html=reports/integration-tests.html \
  --self-contained-html
```

E2E:

```bash
FRONTEND_BASE_URL=http://localhost:4000 \
CYPRESS_API_BASE_URL=http://localhost:5000 \
env -u ELECTRON_RUN_AS_NODE npm --prefix frontend run test:e2e
```

O frontend deste checkout possui uma configuração local ignorada pelo Git que usa a porta `4000`. Jenkins define explicitamente `FRONTEND_BASE_URL=http://localhost:3000`; por isso essa diferença não altera a execução no CI.

## Evidências da execução final

### API

```text
collected 46 items
46 passed in 2.01s
reports/api-tests.xml gerado
reports/api-tests.html gerado
```

### Integração

```text
collected 2 items
2 passed in 0.23s
reports/integration-tests.xml gerado
reports/integration-tests.html gerado
```

### Cypress

```text
auth.cy.js:     2 passed
i18n.cy.js:     1 passed
shopping.cy.js: 2 passed

All specs passed
5 tests, 5 passing, 0 failing
```

Relatórios Mochawesome HTML e JSON foram gerados para os três specs.

### Validações adicionais

```text
Jest: 31 passed
React production build: Compiled successfully
git diff --check: sem erro antes da execução
```

## Riscos restantes

1. O checkout local possui configuração de frontend na porta `4000`, diferente do padrão Jenkins `3000`. Convém documentar formalmente essa escolha ou remover a configuração local se ela não for necessária.
2. `npm ci` reportou dependências transitivas desatualizadas e vulnerabilidades conhecidas. Elas não causaram as falhas atuais, mas devem ser tratadas em uma atualização separada e controlada, pois `npm audit fix --force` pode introduzir breaking changes.
3. O aviso do Browserslist informa que a base `caniuse-lite` está desatualizada. Recomenda-se atualização periódica em commit separado.
4. O frontend consulta novamente cada produto dentro de `ProductCard`, mesmo após receber a lista completa. Isso gera padrão N+1 no navegador e pode aumentar o tempo dos testes e da página. Recomenda-se passar o objeto já carregado ao card em uma refatoração posterior.
5. Um Origin bloqueado atualmente chega ao handler genérico e pode resultar em HTTP `500`. A política continua segura, mas semanticamente seria melhor mapear especificamente a rejeição CORS para `403` em uma melhoria futura.

## Conclusão

As falhas conhecidas foram corrigidas na causa raiz. A política CORS permanece restritiva e configurável, os testes E2E refletem o comportamento funcional atual, seletores estáveis foram restaurados e os três grupos exigidos pelo Quality Gate ficaram verdes sem remoção de testes ou sleeps arbitrários.
