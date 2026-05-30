# Regras de Negócio — ATALAIA E-Commerce

> **Projeto:** ATALAIA — Loja virtual de calçados e acessórios femininos  
> **Versão:** 1.0  
> **Data:** 21/04/2026  
> **Autor:** Revisão automatizada do projeto

---

## 1. Cadastro e Autenticação

| ID | Regra de Negócio |
|----|-----------------|
| RN-01 | O e-mail é o identificador único do usuário; não pode haver dois cadastros com o mesmo e-mail |
| RN-02 | Campos obrigatórios para cadastro: **nome**, **e-mail** e **senha**; telefone é opcional |
| RN-03 | A senha nunca é armazenada em texto puro; é obrigatório uso de hash bcrypt com salt factor 10 |
| RN-04 | O token JWT expira em **7 dias** por padrão (configurável via `JWT_EXPIRE`) |
| RN-05 | Mensagens de erro de autenticação devem ser genéricas ("Credenciais inválidas") para evitar enumeração de contas |
| RN-06 | Todo usuário novo é criado com `is_admin = false` por padrão |
| RN-07 | A redefinição de senha é simplificada (e-mail + nova senha), sem token de confirmação por e-mail (versão MVP) |

---

## 2. Perfis de Acesso (RBAC)

| ID | Regra de Negócio |
|----|-----------------|
| RN-08 | Existem dois perfis de acesso: **Usuário Comum** e **Administrador** |
| RN-09 | A flag `is_admin` (BOOLEAN) na tabela `usuarios` determina o nível de acesso |
| RN-10 | A promoção/rebaixamento de admin só pode ser feita por outro administrador |
| RN-11 | O payload JWT deve conter a claim `is_admin` para autorização no backend |
| RN-12 | Rotas administrativas (`/api/admin/*`) exigem JWT válido **E** `is_admin = true` |
| RN-13 | Usuários comuns que tentarem acessar `/admin` são redirecionados para `/login` |
| RN-14 | O botão ⚙ (Admin) no header só aparece se `user.is_admin === true` |
| RN-15 | O estado `is_admin` do usuário é persistido em `localStorage` junto com o token e dados do usuário |

---

## 3. Catálogo de Produtos

| ID | Regra de Negócio |
|----|-----------------|
| RN-16 | Somente produtos com `ativo = true` aparecem nas listagens públicas (loja e Home) |
| RN-17 | As categorias válidas são: **Botas, Sandálias, Sapatilhas, Bolsas, Acessórios, Tênis, Scarpins** |
| RN-18 | Os campos obrigatórios para um produto são: **nome** e **preço** |
| RN-19 | O estoque padrão de um novo produto é **0 (zero)** |
| RN-20 | Produtos podem ter múltiplas imagens armazenadas em formato JSON (`imagens`) |
| RN-21 | A listagem de produtos é pública e não requer autenticação |
| RN-22 | A busca textual utiliza **ILIKE** (case-insensitive) nos campos nome e descrição |
| RN-23 | A ordenação padrão da listagem é por nome em ordem ascendente (A-Z) |

---

## 4. Sistema de Estrelas (Ranking)

| ID | Regra de Negócio |
|----|-----------------|
| RN-24 | O ranking de produtos é definido por estrelas de **0 a 5** (campo `estrelas` INTEGER) |
| RN-25 | O valor padrão de estrelas é **0** (sem classificação) |
| RN-26 | Apenas administradores podem alterar a classificação de estrelas de um produto |
| RN-27 | O ranking por estrelas é utilizado para destacar "mais vendidos" e "itens especiais" |

---

## 5. Carrinho de Compras

| ID | Regra de Negócio |
|----|-----------------|
| RN-28 | Cada usuário possui **no máximo 1 carrinho ativo** por vez |
| RN-29 | Se o usuário não possuir carrinho ativo, um novo é criado automaticamente ao adicionar o primeiro item |
| RN-30 | Os campos obrigatórios para adicionar ao carrinho são: **produtoId** e **quantidade** |
| RN-31 | Tamanho e cor são opcionais e dependem da natureza do produto |
| RN-32 | A quantidade mínima para atualização de um item é **1** |
| RN-33 | O total do carrinho é calculado como `soma(preço × quantidade)` de todos os itens |
| RN-34 | Somente usuários autenticados podem manipular o carrinho |

---

## 6. Pedidos e Checkout

| ID | Regra de Negócio |
|----|-----------------|
| RN-35 | Campos obrigatórios para criar um pedido: **endereço, cidade, estado, CEP, método de pagamento** |
| RN-36 | O pedido é criado com status **"pendente"** |
| RN-37 | O total do pedido é calculado no servidor a partir dos preços atuais dos produtos no momento da compra |
| RN-38 | O preço unitário é gravado no item do pedido para preservar a referência histórica de preço |
| RN-39 | Após a criação do pedido, o carrinho do usuário é **desativado** (`ativo = false`), não deletado |
| RN-40 | Não é possível criar pedido com carrinho vazio |
| RN-41 | O frete padrão é **R$ 20,00** (fixo, calculado no frontend no checkout) |
| RN-42 | Métodos de pagamento aceitos: **Cartão de Crédito, PIX, Boleto** |
| RN-43 | Telefone no checkout é opcional |

---

## 7. Cupons de Desconto

| ID | Regra de Negócio |
|----|-----------------|
| RN-44 | O código do cupom é armazenado em **MAIÚSCULAS**; a validação converte automaticamente |
| RN-45 | Cupons **inativos** (`ativo = false`) são rejeitados na validação |
| RN-46 | Cupons com **data de expiração vencida** são rejeitados |
| RN-47 | Cupons possuem dois tipos de desconto: **percentual (%)** ou **fixo (R$)** |
| RN-48 | Cada cupom possui um **limite máximo de usos** (`uso_max`, padrão: 100) |
| RN-49 | O código do cupom é **único** no banco de dados (`UNIQUE constraint`) |
| RN-50 | Apenas administradores podem criar, listar e excluir cupons |
| RN-51 | Cupons com desconto percentual devem ter valores **inteiros** (ex: 10%, 20%, 50%) |

---

## 8. Administração

| ID | Regra de Negócio |
|----|-----------------|
| RN-52 | A área administrativa exige **dupla verificação**: token JWT válido + flag `is_admin = true` |
| RN-53 | A exclusão de produtos é um **soft delete** (`ativo = false`), o registro permanece no banco |
| RN-54 | A exclusão de cupons é um **hard delete** (registro é removido permanentemente) |
| RN-55 | A exclusão de usuários é um **hard delete** |
| RN-56 | O Dashboard exibe três métricas: total de usuários, total de produtos ativos, total de cupons |
| RN-57 | O admin pode editar qualquer campo de produto: nome, descrição, categoria, preço, estoque, status |
| RN-58 | O admin **não edita** a senha dos usuários diretamente pelo painel |
| RN-59 | O cadastro de produtos pela loja pública foi removido; o cadastro é exclusivo do Admin |

---

## 9. Lista de Desejos (Wishlist)

| ID | Regra de Negócio |
|----|-----------------|
| RN-60 | Um produto pode ser adicionado à wishlist **apenas uma vez** por usuário (unicidade por par usuario+produto) |
| RN-61 | A wishlist é vinculada ao `usuario_id` e requer autenticação |

---

## 10. Segurança e Infraestrutura

| ID | Regra de Negócio |
|----|-----------------|
| RN-62 | O backend roda na porta **5000** e o frontend na porta **4000** |
| RN-63 | CORS está configurado para aceitar **qualquer origem** em ambiente de desenvolvimento |
| RN-64 | Todos os IDs de entidade utilizam **UUID v4** |
| RN-65 | O JWT Secret padrão em desenvolvimento é `"secret"` (deve ser alterado em produção) |
| RN-66 | O banco de dados é **PostgreSQL** (`sapatos_ecommerce`) |
| RN-67 | Existem índices de performance em: `usuarios.email`, `produtos.categoria`, `carrinhos.usuario_id`, `pedidos.usuario_id` |
| RN-68 | Erros internos do servidor retornam HTTP 500 com mensagem genérica |
| RN-69 | Rotas inexistentes retornam HTTP 404 com `{ error: "Rota não encontrada" }` |

---

## 11. Estado do Frontend (Store)

| ID | Regra de Negócio |
|----|-----------------|
| RN-70 | O token e dados do usuário são persistidos em `localStorage` para sobreviver a reloads |
| RN-71 | O logout limpa token e dados do usuário do `localStorage` e do estado Zustand |
| RN-72 | O carrinho local (Zustand) é sincronizado com a API remota ao carregar a página |

---

## Resumo Quantitativo

| Categoria | Total |
|-----------|:-----:|
| Cadastro e Auth | 7 |
| Perfis de Acesso (RBAC) | 8 |
| Catálogo de Produtos | 8 |
| Sistema de Estrelas | 4 |
| Carrinho de Compras | 7 |
| Pedidos e Checkout | 9 |
| Cupons de Desconto | 8 |
| Administração | 8 |
| Wishlist | 2 |
| Segurança e Infraestrutura | 8 |
| Estado do Frontend | 3 |
| **TOTAL** | **72** |
