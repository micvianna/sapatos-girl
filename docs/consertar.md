### 🛡️ Relatório de Qualidade Atalaia

**Decisão:** ❌ REJEITADO

# 🏛️ Atalaia — Relatório Final

## Veredito: ❌ REJEITADO

 **Score Global** : 45/100

## 📋 Critérios de Aceitação (Regras do Projeto)

# Regras de Negócio do Projeto

## Padrões Arquiteturais

* Toda função deve ter, no mínimo, um teste unitário cobrindo o caminho feliz (happy path).
* Nunca utilize `var` — use sempre `const` ou `let` no JavaScript/TypeScript.
* Deleções de registros no banco de dados devem ser sempre **soft-delete** (campo `deleted_at`), nunca `DELETE` físico.

## Segurança

* Senhas NUNCA devem ser armazenadas em texto puro. Use bcrypt ou Argon2.
* Chaves de API e tokens nunca devem aparecer no código. Use variáveis de ambiente.
* Toda requisição autenticada deve validar o JWT antes de processar a lógica.

## Padrões de Código

* Nomes de variáveis e funções devem ser escritos em português ou inglês, de forma consistente — não misture os idiomas.
* Funções com mais de 30 linhas devem ser refatoradas em subfunções menores.
* Comentários devem explicar o "porquê", não o "o quê".

## Qualidade

* PRs sem testes unitários serão automaticamente marcados como `needs_revision`.
* O campo `test_suites` do Atalaia deve documentar ao menos 2 cenários por nova função adicionada.

## Painel de Agentes

| Agente                   | Veredito                  | Score   |
| ------------------------ | ------------------------- | ------- |
| Code Reviewer            | ❌ REJEITADO              | 0/100   |
| Performance Engineer     | ✅ APROVADO               | 100/100 |
| QA Engineer              | ⚠️ REVISÃO NECESSÁRIA | 50/100  |
| Sandbox Tester           | ❌ REJEITADO              | 0/100   |
| Load Tester              | ⚠️ REVISÃO NECESSÁRIA | 50/100  |
| Security Engineer (SAST) | ❌ REJEITADO              | 0/100   |
| Ticket Compliance        | ✅ APROVADO               | 100/100 |
| UX Designer              | ⚠️ REVISÃO NECESSÁRIA | 50/100  |
| Visual Bug Reporter      | ⚠️ REVISÃO NECESSÁRIA | 50/100  |
| Hound (Supply Chain)     | ⚠️ REVISÃO NECESSÁRIA | 50/100  |

## Detalhamento dos Problemas

### ❌ Code Reviewer

## Resumo Geral

O PR traz uma expansão grande de frontend/backend, mas há regressões graves de segurança e arquitetura que impedem o merge. O ponto mais crítico é a exposição de credenciais padrão e a implementação de exclusões físicas em tabelas onde o próprio projeto exige soft-delete.

## Achados por Severidade

### 🔴 Bloqueantes (REJEITADO)

| Arquivo                                 |   Linha | Problema                                            | Por que é um problema                                                                                                                                                                                                                       | Como corrigir                                                                                                                                |
| --------------------------------------- | ------: | --------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `backend/src/middleware/adminAuth.js` |      12 | JWT secret com fallback fixo (`'secret'`)         | Exibe uma chave sensível padrão no código e permite que ambientes sem variável válida autentiquem com uma chave fraca.                                                                                                                  | Exigir `JWT_SECRET` obrigatório no startup e falhar explicitamente se ausente; usar validação de ambiente centralizada.                 |
| `backend/src/routes/admin.js`         | 45, 175 | Exclusão física de usuários e cupons             | Viola a regra do projeto para deleções no banco:`users` e `cupons` estão usando `DELETE` real.                                                                                                                                      | Substituir por soft-delete quando aplicável (`deleted_at`/`ativo=false`) ou alinhar o schema e as regras de negócio antes do merge.    |
| `backend/src/routes/coupons.js`       |   25-32 | Campos lidos não existem no schema criado neste PR | A rota valida `validade`, `desconto_percentual` e `desconto_fixo`, mas a tabela criada em `backend/migrate_admin.js` usa `expiracao`, `desconto` e `tipo`. Isso corrompe a regra de negócio de cupons e quebra a validação. | Ajustar a query/response para usar os nomes reais do schema ou migrar o schema para refletir a API; incluir testes cobrindo o caminho feliz. |

### 🟡 Importantes (PRECISA_REVISAO)

| Arquivo                               | Linha | Problema                                                      | Por que é um problema                                                                                                                                     | Como corrigir                                                                                                             |
| ------------------------------------- | ----: | ------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `backend/src/routes/orders.js`      |  8-28 | Lógica de RN04/RN06 duplicada em múltiplos lugares          | Há repetição entre backend e frontend para Grande SP, same-day e anti-fraude, aumentando rigidez e risco de divergência.                               | Extrair para um módulo compartilhado de regras de negócio ou funções utilitárias únicas no backend.                 |
| `frontend/src/pages/Checkout.js`    | 27-49 | Regras de negócio duplicadas e função extensa              | A tela calcula mesma-detecção de cidade/horário e também monta payload, valida campos e renderiza checkout; ficou mais difícil de manter e testável. | Separar em helpers puros (`isGrandeSP`, `buildEnderecoCompleto`, `calcPixDiscount`) e reduzir a função principal. |
| `frontend/src/components/Header.js` | 83-89 | Navegação usa `href` + `preventDefault` em links de SPA | Isso é opaco e cria comportamento frágil para o roteamento; além disso, o link de `SALE` ficou comentado.                                             | Trocar por `Link/NavLink` do `react-router-dom` e reativar a navegação de SALE apenas quando houver rota real.      |

### 🟢 Sugestões (APROVADO com nota)

| Arquivo                                 | Linha | Sugestão                                                                                              |
| --------------------------------------- | ----: | ------------------------------------------------------------------------------------------------------ |
| `frontend/src/pages/Login.js`         |    25 | Trocar a URL hardcoded por `REACT_APP_API_URL` para manter consistência com o restante do frontend. |
| `frontend/src/components/MiniCart.js` |    35 | Remover o comentário inline sobre stopPropagation; o nome da função já explica a intenção.       |

## Design Patterns

Não há necessidade clara de novo pattern aqui; o problema principal é repetição de regras e falta de centralização, não ausência de abstração.

## Conclusão

Status:  **rejected** . Antes de reenviar, corrija obrigatoriamente: (1) remoção do fallback fixo do JWT, (2) exclusões físicas em rotas admin, e (3) alinhamento entre schema e validação de cupons. Depois disso, recomendo adicionar testes unitários para os novos caminhos felizes de auth, orders, coupons e admin.

### ❌ Sandbox Tester

Isolei sua lógica e executei um Teste de Segurança em um container efêmero usando Javascript.

 **Teste** : O diff está em JavaScript/Node.js. Este teste valida a lógica nova mais crítica: regra de Grande São Paulo, desconto Pix, status em análise da primeira compra no cartão, middleware de admin e tratamento básico de cupom, cobrindo caminhos felizes, erros e bordas sem depender de banco ou libs externas.

 **Resultado** : Falhou ❌
 **Saída (Exit 1)** :

```
Teste 1: isGrandeSP
PASS ✅
Teste 2: desconto Pix e status do pedido
PASS ✅
Teste 3: adminAuth
/app/test_script.js:1
const assert=(c,m)=>{if(!c)throw new Error(m)};
                           ^

Error: Admin válido deve seguir e anexar req.adminUser
    at assert (/app/test_script.js:1:34)
    at Object.<anonymous> (/app/test_script.js:23:144)
    at Module._compile (node:internal/modules/cjs/loader:1521:14)
    at Module._extensions..js (node:internal/modules/cjs/loader:1623:10)
    at Module.load (node:internal/modules/cjs/loader:1266:32)
    at Module._load (node:internal/modules/cjs/loader:1091:12)
    at Function.executeUserEntryPoint [as runMain] (node:internal/modules/run_main:164:12)
    at node:internal/main/run_main_module:28:49

Node.js v20.20.1

```

### ❌ Security Engineer (SAST)

## Resumo da Auditoria SAST

Repositório: micvianna/sapatos-girl | Achados: 4 críticos, 1 alto, 1 médio

## Mapa de Ataque (OWASP 2025)

* **A01 — Broken Access Control** : rota de admin com decisão baseada em claims do JWT e sem validação de ownership/estado no backend.
* **A02 — Security Misconfiguration** : CORS em `*` no backend, ampliando superfície de abuso.
* **A04 — Cryptographic Failures** : segredo JWT com fallback hardcoded `secret`.
* **A07 — Authentication & Session Failures** : reset de senha sem autenticação/fluxo de recuperação, permitindo takeover.
* **A09 — Logging & Monitoring Failures** : logs de e-mail/nome do primeiro admin durante seed operacional.
* **A10 — Exceptional Conditions** : falhas em rotas críticas devolvem 500 genérico, sem trilha/auditoria de alteração.

## Vulnerabilidades Encontradas

| # | Severidade | Categoria OWASP                                 | Localização                                                                | Vetor de Ataque                                                                                                                                                     | Remediação                                                                                                                 |
| - | ---------- | ----------------------------------------------- | ---------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| 1 | CRITICAL   | A07 — Authentication & Session Failures        | `backend/src/routes/auth.js:104-129`                                       | Reset de senha por e-mail sem prova de posse; qualquer atacante redefine a senha de outra conta                                                                     | Exigir token de reset de uso único, expiração curta e validação no servidor antes do update                             |
| 2 | CRITICAL   | A01 — Broken Access Control                    | `backend/src/routes/admin.js:28-35`, `backend/src/routes/admin.js:43-47` | Qualquer admin autenticado pode promover/demover ou excluir usuários arbitrários sem checar restrições adicionais/segmentação operacional                     | Adicionar autorização por política, trilha de auditoria e proteção contra auto-desativação/remoção do último admin |
| 3 | CRITICAL   | A04 — Cryptographic Failures                   | `backend/src/middleware/adminAuth.js:12`                                   | JWT aceita `process.env.JWT_SECRET                                                                                                                                  |                                                                                                                              |
| 4 | CRITICAL   | A03 — Software & Data Integrity / Supply Chain | `start-project.ps1:22,31,40`                                               | `npm install` sem lock/imutabilidade e execução de `psql -f schema.sql` sem verificação de integridade amplia risco de supply-chain e alteração maliciosa | Usar `npm ci`, lockfile obrigatório e hash/assinatura dos artefatos de schema/migração                                  |
| 5 | HIGH       | A02 — Security Misconfiguration                | `backend/src/server.js:12-14`                                              | `origin: '*'` expõe API a qualquer origem web, facilitando abuso de CSRF-like flows e exfiltração via navegador em cenários com credenciais                   | Restringir origens permitidas por ambiente e habilitar CORS mínimo necessário                                              |
| 6 | MEDIUM     | A09 — Logging & Monitoring Failures            | `backend/migrate_admin.js:50-51`                                           | Loga nome e e-mail do primeiro usuário promovido a admin; isso expõe PII e cria trilha operacional sensível em stdout                                            | Remover PII dos logs e registrar apenas IDs opacos em audit trail estruturado                                                |

## Detalhamento por Achado

### 🔴 [CRITICAL] — Redefinição de senha sem prova de posse (A07 — Authentication & Session Failures)

 **Localização** : `backend/src/routes/auth.js`, linhas 104-129
 **Padrão detectado** : fluxo de reset aceitando `email` + `novaSenha` e executando update direto
 **Ataque possível** : um atacante informa o e-mail de qualquer usuário e define uma nova senha, assumindo a conta imediatamente
 **Impacto** : comprometimento total de contas, perda de confidencialidade e possibilidade de fraude/transações em nome da vítima
 **Remediação** : exigir token de reset de uso único com expiração e validação antes do update; exemplo: gerar token aleatório com `secrets`, armazenar hash + TTL e validar no endpoint de troca

### 🔴 [CRITICAL] — Escalação/remoção administrativa sem proteções adicionais (A01 — Broken Access Control)

 **Localização** : `backend/src/routes/admin.js`, linhas 28-35 e 43-47
 **Padrão detectado** : update/delete direto por `req.params.id` em rotas administrativas sem salvaguardas contra abuso operacional
 **Ataque possível** : um admin comprometido ou de baixo privilégio revoga outros admins, remove contas críticas ou reconfigura acesso sem rastreabilidade robusta
 **Impacto** : perda de controle administrativo, interrupção do serviço e escalada lateral dentro do painel
 **Remediação** : aplicar policy de autorização por papel/escopo, impedir remoção do último admin, registrar auditoria imutável e exigir confirmação forte para ações destrutivas

### 🔴 [CRITICAL] — Segredo JWT com fallback previsível (A04 — Cryptographic Failures)

 **Localização** : `backend/src/middleware/adminAuth.js`, linha 12
 **Padrão detectado** : `jwt.verify(token, process.env.JWT_SECRET || 'secret')`
 **Ataque possível** : em ambiente onde a variável não esteja definida, o atacante gera tokens válidos com a chave previsível `secret`
 **Impacto** : falsificação de JWT, bypass de autenticação administrativa e acesso total ao painel
 **Remediação** : falhar na inicialização se `JWT_SECRET` estiver ausente; usar um segredo forte gerenciado por secrets manager e rotação periódica

## Veredito Final

REJEITADO
Há autenticação de reset insegura, falha de autorização administrativa e segredo criptográfico previsível; isso permite takeover e bypass de acesso, exigindo correção antes de produção.

## Métricas

* Vulnerabilidades: 5
* Categoria Principal: A01 — Broken Access Control
* Score de Segurança: F

## Checklists

* [X] Sanitização OWASP (marque [x] se estiver ok e não houver SQLi/XSS)
* [ ] Proteção de Segredos (marque [x] se não houver hardcoded)
* [ ] Conf. Segura (marque [x] se não houver fail-open ou disable SSL)

### ⚠️ QA Engineer

## QA Report — sapatos-girl

### Cobertura Avaliada

Foram adicionadas novas rotas e fluxos críticos em backend e frontend: administração (`backend/src/routes/admin.js:1-205`), autenticação com flag administrativa e reset de senha (`backend/src/routes/auth.js:39-129`), cupom (`backend/src/routes/coupons.js:1-40`), wishlist (`backend/src/routes/wishlist.js:1-77`), pedido com regras de negócio de frete/desconto/anti-fraude (`backend/src/routes/orders.js:8-115`), carrinho com limpeza total (`backend/src/routes/cart.js:73-90`) e novas telas/fluxos no frontend (`frontend/src/pages/Admin.js:24-277`, `frontend/src/pages/Checkout.js:27-320`, `frontend/src/pages/Login.js:16-129`, `frontend/src/pages/ProductDetail.js:12-157`, `frontend/src/components/ProductCard.js:12-143`).

### Lacunas Identificadas

* 🔴 [P0] Admin auth não cobre falhas de token malformado/expirado e ausência de permissões em todas as rotas protegidas; precisa validação unitária do middleware e integração das rotas admin (`backend/src/middleware/adminAuth.js:3-20`, `backend/src/routes/admin.js:7-203`).
* 🔴 [P0] Reset de senha e login/register atualizados com persistência de `is_admin`, mas faltam testes de token JWT gerado com claim correta e bloqueio de acesso ao painel para não-admin (`backend/src/routes/auth.js:39-129`, `frontend/src/pages/Login.js:56-63`, `frontend/src/App.js:49-53`).
* 🟡 [P1] Regras de cupom têm inconsistência de schema/uso (`expiracao` vs `validade`, `desconto` vs `desconto_percentual/desconto_fixo`), então a validação atual pode retornar payload incorreto sem teste cobrindo isso (`backend/src/routes/coupons.js:12-33`, `backend/migrate_admin.js:29-60`).
* 🟡 [P1] Checkout/pedido: desconto Pix, same-day SP e anti-fraude primeira compra precisam testes de boundary por cidade/estado, horário e método de pagamento (`backend/src/routes/orders.js:20-115`, `frontend/src/pages/Checkout.js:39-103`).
* 🟡 [P1] Integrações com Postgres e chamadas HTTP do frontend estão sem contract tests com mock de sucesso/timeout/500/resposta malformada; isso inclui `pool.query` e `axios/fetch` em `frontend/src/store/index.js:74-145`, `frontend/src/pages/Login.js:18-40`, `frontend/src/pages/ProductDetail.js:28-57`, `frontend/src/components/ProductCard.js:25-89`.

### Recomendações de Infraestrutura de Testes

* Unit: mock de `jwt.verify`, `bcrypt`, `pool.query`, `axios` e `useAuthStore/useCartStore`.
* Integration: usar `supertest` + banco de teste ou mock do `pool` para rotas `/api/admin`, `/api/auth/reset`, `/api/coupons/validate`, `/api/orders/criar`.
* Frontend: MSW para rotas de API e React Testing Library para Home/Checkout/Login/Admin/ProductDetail.
* Fixtures: usuários com e sem `is_admin`, cupom ativo/expirado, pedido com primeira compra, produto com estoque zero, cidade SP/não-SP, horários antes/depois do meio-dia.

## Métricas

* Lacunas P0/P1: 5
* Novos Testes Sugeridos: 5
* Cobertura Estimada: C+

## Checklists

* [X] Testes Unitários presentes
* [X] Regras de Negócio cobertas
* [X] Tratamento de Erros testado

### Veredito

Há mudanças críticas de autenticação, admin e regras de checkout/cupom sem cobertura suficiente para garantir comportamento seguro e estável. O PR precisa de revisão, principalmente em middleware JWT, rotas admin e contratos de integração com banco/API.

### ⚠️ Load Tester

⚠️ O agente `Load Tester` falhou silenciosamente e não gerou feedback. Este PR requer revisão manual.

### ⚠️ UX Designer

## UX & Accessibility Audit — micvianna/sapatos-girl

### Resumo

Violações: 1 críticas, 0 sérias, 1 moderadas | WCAG Level: AA

### Violações Encontradas

| # | Severidade  | Critério WCAG    | Elemento                                          | Problema                                                                                             | Remediação                                                                                  |
| - | ----------- | ----------------- | ------------------------------------------------- | ---------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| 1 | 🔴 CRITICAL | 1.1.1 Alt Text    | `frontend/src/pages/Home.css:89`                | Hero usa imagem informativa via `background-image`, sem alternativa textual programática          | Mover a imagem para `<img>` com `alt` descritivo ou fornecer conteúdo equivalente no DOM |
| 2 | 🟠 MODERATE | 2.5.5 Target Size | `frontend/src/components/ProductCard.css:33-44` | Botão de wishlist fica oculto/pequeno no hover; em touch e motor-impaired pode não atingir 44x44px | Garantir alvo mínimo 44x44px e manter acionamento sempre visível/acionável por toque       |

### Detalhamento

#### 🔴 CRITICAL — 1.1.1 Alt Text — Hero sem alternativa textual

 **Elemento** : `frontend/src/pages/Home.css:89-106`
 **Impacto para usuários** : Usuários de leitores de tela não recebem a informação visual principal do hero; a imagem atua como conteúdo de destaque e fica inacessível.
 **Remediação** : Renderizar a imagem como elemento semântico no JSX, por exemplo `\<img src=... alt="Descrição do hero" />`, mantendo o overlay textual como conteúdo real no DOM.

### Aprovação / Rejeição

**rejected** — há uma violação crítica de conteúdo informativo sem alternativa textual (1.1.1), o que bloqueia o acesso equivalente ao conteúdo principal. A revisão também aponta um alvo de toque potencialmente insuficiente no card de produto, exigindo ajuste antes de aprovar.

## Métricas

* Performance: 74
* Accessibility: 58
* Best Practices: 72
* SEO: 66

### ⚠️ Visual Bug Reporter

⚠️ O agente `Visual Bug Reporter` falhou silenciosamente e não gerou feedback. Este PR requer revisão manual.

### ⚠️ Hound (Supply Chain)

## Hound — Supply Chain Audit Report

### Dependências Analisadas

* `typescript:4.9.5`

### 🟡 Dependências com Alertas

| Pacote         | Versão   | Aviso                                                                                                                                                                                                                             | Recomendação                                                                                              |
| -------------- | --------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| `typescript` | `4.9.5` | Downgrade de major/minor em relação ao lock anterior (`5.9.3` → `4.9.5`), com relaxamento do requisito de Node. Isso aumenta a superfície de incompatibilidade e pode mascarar dependências de toolchain não alinhadas. | Validar se o downgrade é intencional; preferir manter a versão anterior ou documentar o motivo/changelog. |

### Checklist de Integridade

* [X] Lock file presente e commitado
* [X] Hashes de integridade presentes
* [X] Nenhum sinal de typosquatting
* [X] Nenhum pacote com acesso a execução de código de terceiros sem justificativa

### Resumo Executivo

A cadeia de suprimentos está majoritariamente estável, mas há um downgrade relevante em `typescript` que merece revisão para evitar regressões de tooling e compatibilidade.
