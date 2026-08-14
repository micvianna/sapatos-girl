# Defeitos encontrados e corrigidos

Todos os itens abaixo foram corrigidos e possuem cobertura automatizada na suíte atual.

## Pool PostgreSQL indisponível em todas as rotas

**Título:** importação circular deixa `pool` indefinido nas rotas  
**Pré-condição:** PostgreSQL saudável, schema carregado e backend iniciado  
**Passos:** executar `GET /api/products` ou `POST /api/auth/register` com payload válido  
**Resultado atual:** resposta HTTP 500  
**Resultado esperado:** resposta de sucesso correspondente ao endpoint  
**Evidência técnica:** o Node alerta `Accessing non-existent property 'pool' of module exports inside circular dependency`; em seguida ocorre `TypeError: Cannot read properties of undefined (reading 'query')`. `server.js` carrega as rotas antes de executar `module.exports = { app, pool }`, enquanto cada rota desestrutura `pool` de `server.js`.  
**Endpoint/componente afetado:** todas as rotas que acessam o banco; `backend/src/server.js` e `backend/src/routes/*.js`  
**Severidade sugerida:** bloqueadora

## Cadastro aceita e-mail malformado

**Título:** API não valida o formato do e-mail no cadastro  
**Pré-condição:** defeito bloqueador do pool corrigido  
**Passos:** enviar `POST /api/auth/register` com `email: "email-invalido"` e os demais campos válidos  
**Resultado atual:** o código aceita qualquer string não vazia  
**Resultado esperado:** HTTP 400 com mensagem de validação  
**Evidência técnica:** a validação em `backend/src/routes/auth.js` verifica somente se `email` possui valor  
**Endpoint/componente afetado:** `POST /api/auth/register`  
**Severidade sugerida:** média

## Carrinho aceita quantidade negativa

**Título:** inclusão no carrinho não exige quantidade positiva  
**Pré-condição:** usuário autenticado e produto existente  
**Passos:** enviar `POST /api/cart/adicionar` com `quantidade: -1`  
**Resultado atual:** o valor é aceito porque números negativos são truthy em JavaScript  
**Resultado esperado:** HTTP 400  
**Evidência técnica:** a inclusão valida `!quantidade`, mas não valida `quantidade < 1`; o schema também não possui restrição `CHECK`  
**Endpoint/componente afetado:** `POST /api/cart/adicionar` e tabela `itens_carrinho`  
**Severidade sugerida:** alta

## Produto inexistente retorna erro interno ao adicionar

**Título:** produto inexistente no carrinho é tratado como erro 500  
**Pré-condição:** usuário autenticado  
**Passos:** enviar `POST /api/cart/adicionar` com UUID de produto inexistente  
**Resultado atual:** a inserção viola a chave estrangeira e cai no tratamento genérico HTTP 500  
**Resultado esperado:** HTTP 400 ou 404 com erro de produto inválido  
**Evidência técnica:** a rota insere diretamente em `itens_carrinho` sem consultar `produtos`  
**Endpoint/componente afetado:** `POST /api/cart/adicionar`  
**Severidade sugerida:** média

## ID de produto malformado retorna erro interno

**Título:** parâmetro UUID inválido chega sem validação ao PostgreSQL  
**Pré-condição:** backend conectado ao banco  
**Passos:** executar `GET /api/products/id-invalido`  
**Resultado atual:** o cast de UUID do PostgreSQL falha e a rota retorna HTTP 500  
**Resultado esperado:** HTTP 400  
**Evidência técnica:** `req.params.id` é passado diretamente para a consulta sem validação de formato  
**Endpoint/componente afetado:** `GET /api/products/:id`  
**Severidade sugerida:** baixa
