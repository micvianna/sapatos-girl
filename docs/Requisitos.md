# Documentação de Requisitos: ATALAIA (E-commerce)

Este documento descreve as Regras de Negócio (RN), Requisitos Funcionais (RF) e Requisitos Não Funcionais (RNF) que norteiam a plataforma de e-commerce da marca de luxo **ATALAIA** (anteriormente *Shoe Style*).

---

## 1. Regras de Negócio (RN)

As regras de negócio definem as políticas e restrições operacionais da loja.

*   **RN01 - Restrição de Compra:** Apenas usuários devidamente autenticados (logados e com token JWT válido) podem adicionar itens ao carrinho e finalizar pedidos. Visitantes não autenticados são redirecionados automaticamente para a tela de login.
*   **RN02 - Desconto por Método de Pagamento:** Pedidos finalizados através da modalidade "Pix Instantâneo" recebem obrigatoriamente um desconto automático de 5% sobre o valor total do carrinho.
*   **RN03 - Gestão de Estoque Vazia:** Produtos cujo estoque (`estoque`) seja igual a zero (0) não podem ser adicionados ao carrinho. O botão de compra deve ser desativado visivelmente ("Esgotado").
*   **RN04 - Prazo de Entrega Exclusivo (ATALAIA Black):** Clientes com endereço logístico na "Grande São Paulo" cuja compra seja confirmada até as 12h00 recebem frete promocional "Same-Day" (entrega até as 21h00 do mesmo dia).
*   **RN05 - Devoluções e Trocas:** O cliente possui o prazo incontestável de 7 dias Corridos/Úteis para solicitar devolução (Art. 49 do CDC), exigindo-se que o produto não apresente marcas de uso na sola e retorne na embalagem original (caixa magna + dust bags). Itens marcados como "SALE/ÚLTIMAS PEÇAS" não são totalmente elegíveis para estorno em dinheiro, apenas para obtenção de vouchers/créditos em loja.
*   **RN06 - Segurança Anti-Fraude:** A primeira compra de um usuário com Cartão de Crédito é submetida a um gateway de proteção anti-fraude terceirizado, mantendo o pedido com status "Em Análise" por até 48h antes da liberação e separação do estoque.

---

## 2. Requisitos Funcionais (RF)

As funcionalidades e comportamentos diretos que o sistema deve fornecer ao usuário.

*   **RF01 - Catálogo de Produtos:** O sistema deve listar produtos segmentados por categorias através de links específicos (`NEW IN`, `SAPATOS`, `BOLSAS`, `ACESSÓRIOS`, `SALE`).
*   **RF02 - Filtros e Busca:** O sistema deve permitir que o cliente filtre o catálogo de produtos por subcategorias e faixas de preço (`preço min` e `preço max`), além de uma barra de busca geral.
*   **RF03 - Autenticação e Autorização:** O sistema deve fornecer mecanismos de Cadastro de Novo Usuário (Nome, Email, Senha) e Login, utilizando senhas criptografadas (`bcrypt`) e tokens de sessão (`JWT`).
*   **RF04 - Gestão de Carrinho:** O sistema deve permitir ao cliente adicionar produtos, alterar a quantidade (incrementar/decrementar) e remover um produto específico do carrinho. Deve também conter um botão de "Limpar Carrinho" para redefini-lo a zero.
*   **RF05 - Indicador Dinâmico de Carrinho:** O cabeçalho (`Header`) deve possuir um ícone numérico (Badge) sinalizando a quantidade exata de itens físicos alocados virtualmente no carrinho (escondido se vazio).
*   **RF06 - Destaque de Navegação (Active Route):** A plataforma deve destacar (via estilização/sublinhado contínuo) a categoria atual do site que o cliente está navegando baseando-se no parâmetro de busca (`?category=...`).
*   **RF07 - Páginas Informativas:** O sistema deve conter as páginas estáticas renderizadas por rota (A Marca, Lojas Físicas, Trabalhe Conosco, Contato, FAQ, Trocas, Prazos de Entrega, Pagamento, Privacidade).
*   **RF08 - Perfil do Usuário (Account):** O sistema deve oferecer um portal onde o usuário enxergue suas informações pessoais e possua a funcionalidade de "Logout" para limpar os dados da sessão local.
*   **RF09 - Favoritos (Wishlist):** O usuário pode clicar no ícone de "Coração" disponível em cada "Card" de produto para salvar o item numa lista de interesses futuros (A ser implementado/mantido ativamente em memória ou banco).

---

## 3. Requisitos Não Funcionais (RNF)

Requisitos pautados em tecnologias, atributos de qualidade, UX e métricas.

*   **RNF01 - Stack Tecnológica (Frontend):** A interface do cliente deve ser programada em **React.js** manipulando o React Router DOM (Single Page Application genérica). Gerenciamento de estado deverá ser efetuado através do **Zustand**.
*   **RNF02 - Stack Tecnológica (Backend):** O servidor computacional deve rodar **Node.js** em sintonia com a framework web **Express.js**.
*   **RNF03 - Arquitetura de DB:** O sistema persistente será regido pelo Banco de Dados Relacional **PostgreSQL** (`pg`), estruturado em UUIDs em suas chaves primárias.
*   **RNF04 - Identidade Visual (UI/UX):** O estilo deve invocar sensações de luxo, altivez e exclusividade. Paleta de cores escura com alto contraste (texto principal), realces em tons de dourado (`#d4af37`), vermelho rosado para links promocionais transitórios, minimalismo de bordas e tipografia serifada/fina (`letter-spacing`).
*   **RNF05 - Responsividade Móbile:** O layout deve reagir proporcionalmente (`media queries`) a resoluções iguais ou menores a `768px`, ocultando o menu de links no cabeçalho sob um componente "Hamburger" clássico e re-arranjando grades em colunas singulares.
*   **RNF06 - Tratamento de Erros e Rotas Quebradas (UX):** As chamadas API assíncronas que falharem em retornar (ex: Token Inativo 401) devem redirecionar a controladora global, ao invés de atirar alertas rudes em tela para o cliente (`window.alert`).
*   **RNF07 - Internacionalização (i18n):** Estruturas estáticas essenciais prontas devem estar cobertas pelo conector `react-i18next` para futuras intersecções em inglês/espanhol do mercado cosmopolitano.
*   **RNF08 - Segurança e Injeção de Dependências:** Impede-se explicitamente rotas não tratadas, mantendo chaves ambientais (`.env` isolado), lidando com senhas puramente através de salt hashes (Evitando plain-text storing).
