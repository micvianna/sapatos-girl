# Requisitos Funcionais — ATALAIA E-Commerce

> **Projeto:** ATALAIA — Loja virtual de calçados e acessórios femininos  
> **Versão:** 1.0  
> **Data:** 21/04/2026  
> **Autor:** Revisão automatizada do projeto

---

## 1. Módulo de Autenticação e Conta (AUTH)

| ID | Requisito | Status |
|----|-----------|--------|
| RF-AUTH-01 | O sistema deve permitir o cadastro de novos usuários com nome, e-mail, senha e telefone (opcional) | ✅ Implementado |
| RF-AUTH-02 | O sistema deve impedir cadastro com e-mail já existente | ✅ Implementado |
| RF-AUTH-03 | A senha do usuário deve ser armazenada com hash bcrypt (salt 10) | ✅ Implementado |
| RF-AUTH-04 | O sistema deve gerar um token JWT válido por 7 dias ao registrar ou autenticar | ✅ Implementado |
| RF-AUTH-05 | O sistema deve permitir login com e-mail e senha | ✅ Implementado |
| RF-AUTH-06 | O sistema deve retornar mensagem genérica "Credenciais inválidas" para e-mail ou senha incorretos | ✅ Implementado |
| RF-AUTH-07 | O sistema deve permitir redefinição simplificada de senha informando e-mail e nova senha | ✅ Implementado |
| RF-AUTH-08 | O sistema deve retornar o flag `is_admin` no payload JWT e na resposta de login/registro | ✅ Implementado |
| RF-AUTH-09 | Administradores devem ser redirecionados automaticamente para `/admin` após login | ✅ Implementado |

---

## 2. Módulo de Perfil do Usuário (USERS)

| ID | Requisito | Status |
|----|-----------|--------|
| RF-USER-01 | Usuário autenticado pode consultar seu perfil (id, nome, e-mail, telefone, data de criação) | ✅ Implementado |
| RF-USER-02 | Usuário autenticado pode atualizar nome e telefone do perfil | ✅ Implementado |
| RF-USER-03 | A página "Minha Conta" deve exibir nome e e-mail do usuário logado | ✅ Implementado |
| RF-USER-04 | A página "Minha Conta" deve conter botão de logout | ✅ Implementado |

---

## 3. Módulo de Catálogo de Produtos (PRODUCTS)

| ID | Requisito | Status |
|----|-----------|--------|
| RF-PROD-01 | O sistema deve listar todos os produtos ativos | ✅ Implementado |
| RF-PROD-02 | O sistema deve permitir filtro por categoria | ✅ Implementado |
| RF-PROD-03 | O sistema deve permitir filtro por faixa de preço (mínimo e máximo) | ✅ Implementado |
| RF-PROD-04 | O sistema deve permitir busca textual por nome ou descrição (ILIKE) | ✅ Implementado |
| RF-PROD-05 | O sistema deve retornar detalhes de um produto específico por ID | ✅ Implementado |
| RF-PROD-06 | Produtos inativos (`ativo = false`) não devem aparecer nas listagens públicas | ✅ Implementado |
| RF-PROD-07 | A Home Page deve exibir carrossel de até 4 produtos em cada seção temática | ✅ Implementado |
| RF-PROD-08 | Cada card de produto deve exibir imagem, nome, preço e botão "COMPRAR" | ✅ Implementado |
| RF-PROD-09 | O sistema deve suportar as categorias: Botas, Sandálias, Sapatilhas, Bolsas, Acessórios, Tênis, Scarpins | ✅ Implementado |

---

## 4. Módulo de Carrinho de Compras (CART)

| ID | Requisito | Status |
|----|-----------|--------|
| RF-CART-01 | Usuário autenticado pode adicionar produto ao carrinho (com quantidade, tamanho e cor opcionais) | ✅ Implementado |
| RF-CART-02 | O sistema deve criar automaticamente um carrinho ativo se o usuário não possuir um | ✅ Implementado |
| RF-CART-03 | Usuário pode visualizar os itens do carrinho com nome, preço, imagem, quantidade, subtotal e total | ✅ Implementado |
| RF-CART-04 | Usuário pode remover um item específico do carrinho | ✅ Implementado |
| RF-CART-05 | Usuário pode esvaziar o carrinho inteiro | ✅ Implementado |
| RF-CART-06 | Usuário pode atualizar a quantidade de um item (mínimo 1) | ✅ Implementado |
| RF-CART-07 | O carrinho deve calcular automaticamente o total geral | ✅ Implementado |

---

## 5. Módulo de Pedidos (ORDERS)

| ID | Requisito | Status |
|----|-----------|--------|
| RF-ORD-01 | Usuário autenticado pode criar um pedido informando endereço, cidade, estado, CEP e método de pagamento | ✅ Implementado |
| RF-ORD-02 | O pedido deve ser criado com status inicial "pendente" | ✅ Implementado |
| RF-ORD-03 | Ao criar pedido, o sistema deve calcular o total a partir dos itens do carrinho ativo | ✅ Implementado |
| RF-ORD-04 | Após criar o pedido, o carrinho ativo deve ser desativado (`ativo = false`) | ✅ Implementado |
| RF-ORD-05 | Os itens do pedido devem registrar preço unitário no momento da compra | ✅ Implementado |
| RF-ORD-06 | Usuário pode consultar histórico de pedidos ordenados por data (mais recente primeiro) | ✅ Implementado |
| RF-ORD-07 | O checkout deve exibir resumo dos itens, subtotal, frete fixo (R$ 20,00) e total geral | ✅ Implementado |
| RF-ORD-08 | O checkout deve suportar os métodos: Cartão de Crédito, PIX, Boleto | ✅ Implementado |

---

## 6. Módulo de Lista de Desejos (WISHLIST)

| ID | Requisito | Status |
|----|-----------|--------|
| RF-WISH-01 | Usuário pode adicionar um produto à lista de desejos | ✅ Implementado |
| RF-WISH-02 | O sistema deve impedir duplicidade na lista de desejos | ✅ Implementado |
| RF-WISH-03 | Usuário pode remover um produto da lista de desejos | ✅ Implementado |
| RF-WISH-04 | Usuário pode consultar todos os produtos da sua lista de desejos | ✅ Implementado |

---

## 7. Módulo de Cupons de Desconto (COUPONS)

| ID | Requisito | Status |
|----|-----------|--------|
| RF-CPN-01 | O sistema deve validar um cupom por código (case-insensitive → UPPER) | ✅ Implementado |
| RF-CPN-02 | Cupons inativos (`ativo = false`) devem ser rejeitados | ✅ Implementado |
| RF-CPN-03 | Cupons com validade expirada devem ser rejeitados | ✅ Implementado |
| RF-CPN-04 | A resposta de validação deve retornar o desconto percentual e/ou fixo aplicável | ✅ Implementado |

---

## 8. Módulo Administrativo (ADMIN)

| ID | Requisito | Status |
|----|-----------|--------|
| RF-ADM-01 | Todas as rotas `/api/admin/*` devem ser protegidas por JWT + verificação `is_admin` | ✅ Implementado |
| RF-ADM-02 | O painel deve exibir Dashboard com contagem total de usuários, produtos ativos e cupons | ✅ Implementado |
| RF-ADM-03 | Admin pode listar todos os usuários (id, nome, e-mail, is_admin, data de criação) | ✅ Implementado |
| RF-ADM-04 | Admin pode promover ou rebaixar o privilégio `is_admin` de qualquer usuário | ✅ Implementado |
| RF-ADM-05 | Admin pode excluir um usuário pelo ID | ✅ Implementado |
| RF-ADM-06 | Admin pode listar todos os produtos (incluindo inativos) | ✅ Implementado |
| RF-ADM-07 | Admin pode criar um novo produto com nome, descrição, categoria, preço, imagem, estoque | ✅ Implementado |
| RF-ADM-08 | Admin pode editar qualquer campo de um produto existente (nome, preço, estoque, ativo, etc.) | ✅ Implementado |
| RF-ADM-09 | Admin pode classificar um produto com estrelas de 0 a 5 (ranking de destaque) | ✅ Implementado |
| RF-ADM-10 | Admin pode desativar um produto (soft delete via `ativo = false`) | ✅ Implementado |
| RF-ADM-11 | Admin pode criar cupons de desconto informando: código, valor (%), tipo, data de expiração e limite de uso | ✅ Implementado |
| RF-ADM-12 | Admin pode listar todos os cupons cadastrados | ✅ Implementado |
| RF-ADM-13 | Admin pode excluir cupons | ✅ Implementado |
| RF-ADM-14 | O painel admin deve ter abas para Dashboard, Usuários, Produtos e Cupons | ✅ Implementado |
| RF-ADM-15 | O link para o Admin no header deve ser visível apenas para usuários com `is_admin = true` | ✅ Implementado |

---

## 9. Módulo de Navegação e Interface (UI)

| ID | Requisito | Status |
|----|-----------|--------|
| RF-UI-01 | O Header deve contar links para: NEW IN, BOTAS, SAPATOS, BOLSAS, ACESSÓRIOS, SALE | ✅ Implementado |
| RF-UI-02 | O Header deve exibir ícones de busca, conta, configurações (admin) e carrinho | ✅ Implementado |
| RF-UI-03 | O Footer deve conter links institucionais: Sobre, Lojas, Carreiras, Contato | ✅ Implementado |
| RF-UI-04 | O Footer deve conter links de serviço: FAQ, Trocas, Entregas, Pagamento, Privacidade | ✅ Implementado |
| RF-UI-05 | A aplicação deve suportar internacionalização (i18n) | ✅ Implementado |
| RF-UI-06 | Rotas protegidas (/account, /cart, /checkout) devem redirecionar para /login se não autenticado | ✅ Implementado |
| RF-UI-07 | A rota /admin deve redirecionar para /login se o usuário não for admin | ✅ Implementado |

---

## 10. Páginas Institucionais

| ID | Requisito | Status |
|----|-----------|--------|
| RF-INST-01 | O sistema deve disponibilizar página Sobre Nós (`/sobre`) | ✅ Implementado |
| RF-INST-02 | O sistema deve disponibilizar página de Lojas (`/lojas`) | ✅ Implementado |
| RF-INST-03 | O sistema deve disponibilizar página de Carreiras (`/carreiras`) | ✅ Implementado |
| RF-INST-04 | O sistema deve disponibilizar página de Contato (`/contato`) | ✅ Implementado |
| RF-INST-05 | O sistema deve disponibilizar página de Política de Privacidade (`/politica-privacidade`) | ✅ Implementado |
| RF-INST-06 | O sistema deve disponibilizar página de FAQ (`/faq`) | ✅ Implementado |
| RF-INST-07 | O sistema deve disponibilizar página de Trocas e Devoluções (`/trocas`) | ✅ Implementado |
| RF-INST-08 | O sistema deve disponibilizar página de Entregas (`/entregas`) | ✅ Implementado |
| RF-INST-09 | O sistema deve disponibilizar página de Formas de Pagamento (`/pagamento`) | ✅ Implementado |

---

## Resumo Quantitativo

| Módulo | Total de Requisitos |
|--------|:---:|
| Autenticação | 9 |
| Perfil | 4 |
| Catálogo | 9 |
| Carrinho | 7 |
| Pedidos | 8 |
| Wishlist | 4 |
| Cupons | 4 |
| Admin | 15 |
| Navegação/UI | 7 |
| Institucional | 9 |
| **TOTAL** | **76** |
