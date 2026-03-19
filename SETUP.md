# 🚀 Guia de Instalação e Setup - ShoeStyle E-commerce

## ✅ Pré-requisitos

Antes de começar, certifique-se de ter instalado:

- **Node.js 16+** - [Baixar](https://nodejs.org/)
- **PostgreSQL 12+** - [Baixar](https://www.postgresql.org/)
- **Git** - [Baixar](https://git-scm.com/)
- **npm** (vem com Node.js)

## 📦 Passo 1: Clonar/Preparar o Projeto

```bash
cd d:\workspace\testes_atalaia
```

## 🗄️ Passo 2: Configurar Banco de Dados

### Windows (PowerShell ou CMD):

```bash
# Conectar ao PostgreSQL
psql -U postgres -h localhost

# No prompt do PostgreSQL:
postgres=# CREATE DATABASE sapatos_ecommerce;
postgres=# \c sapatos_ecommerce
postgres=# \i 'D:/workspace/testes_atalaia/database/schema.sql'
postgres=# \q
```

Ou usando uma GUI como pgAdmin ou DBeaver (mais fácil).

### Verificar Banco de Dados:

```bash
psql -U postgres -c "SELECT datname FROM pg_database WHERE datname='sapatos_ecommerce';"
```

## ⚙️ Passo 3: Configurar Backend

```bash
# Entrar na pasta backend
cd backend

# Instalar dependências
npm install

# Criar arquivo .env
Copy-Item .env.example .env

# Editar o .env com suas credenciais do PostgreSQL
# Abrir .env e preenchero:
# DB_HOST=localhost
# DB_PORT=5432
# DB_NAME=sapatos_ecommerce
# DB_USER=seu_usuario_postgres
# DB_PASSWORD=sua_senha_postgres
```

### Testar Backend:

```bash
# Do diretório backend
npm run dev
```

Você deve ver: `Servidor rodando na porta 5000`

## 🎨 Passo 4: Configurar Frontend

```bash
# Voltar à pasta raiz
cd ..

# Entrar na pasta frontend
cd frontend

# Instalar dependências
npm install

# Frontend está pronto (não precisa de .env extra, usa localhost:5000 por padrão)
```

### Testar Frontend:

```bash
# Do diretório frontend
npm start
```

O navegador abrirá automaticamente em `http://localhost:3000`

## 🎯 Passo 5: Testar a Aplicação

### 1. Criar uma Conta:

- Clique em "Cadastrar"
- Preencha os dados (nome, email, senha)
- Clique em "Cadastrar"

### 2. Fazer Login:

- Clique em "Entrar"
- Use suas credenciais
- Será redirecionado para home

### 3. Navegar pelos Produtos:

- Clique em "Produtos" no menu
- Use os filtros (categoria, preço)
- Clique em um produto para ver detalhes

### 4. Adicionar ao Carrinho:

- Escolha tamanho e cores (se houver opções)
- Defina a quantidade
- Clique em "Adicionar ao Carrinho"

### 5. Fazer Compra:

- Clique no ícone do carrinho
- Revise itens e quantidades
- Clique em "Finalizar Compra"
- Preencha endereço de entrega
- Escolha método de pagamento
- Clique em "Confirmar Pedido"

## 🌐 Trocar Idioma

- Clique no seletor de idioma no header
- Escolha PT (Português) ou EN (English)
- Interface muda instantaneamente

## 📝 Variáveis de Ambiente Importantes

### Backend (.env)

```
PORT=5000
NODE_ENV=development
DB_HOST=localhost
DB_PORT=5432
DB_NAME=sapatos_ecommerce
DB_USER=postgres
DB_PASSWORD=your_password
JWT_SECRET=sua_chave_secreta_aqui
CORS_ORIGIN=http://localhost:3000
```

### Frontend (.env)

```
REACT_APP_API_URL=http://localhost:5000
```

## 🆘 Troubleshooting

### Erro: "Can't find module"

```bash
# Reinstalar dependências
rm -r node_modules package-lock.json
npm install
```

### Erro: "Connection refused" (Banco de dados)

- Verificar se PostgreSQL está rodando
- Verificar credenciais no .env
- Verificar se banco foi criado

### Erro: "Port already in use"

- Backend: Trocar `PORT` em .env
- Frontend: `PORT=3001 npm start`

### Erro ao carregar produtos

- Verificar se backend está rodando (`npm run dev`)
- Verificar console do navegador (F12)
- Verificar logs do backend

## 📜 Estrutura de Pastas Explicada

```
testes_atalaia/
│
├── backend/                 # API REST
│   ├── src/
│   │   ├── server.js       # Servidor principal
│   │   ├── middleware/     # Autenticação, etc
│   │   └── routes/         # Endpoints da API
│   ├── package.json
│   └── .env.example
│
├── frontend/                # React App
│   ├── src/
│   │   ├── components/     # Header, Footer, ProductCard
│   │   ├── pages/          # Home, Products, Cart, Checkout
│   │   ├── store/          # Zustand state management
│   │   ├── locales/        # Traduções (pt-BR, en-US)
│   │   ├── i18n.js         # Configuração de idiomas
│   │   └── App.js          # Componente principal
│   ├── public/
│   │   └── index.html      # HTML base
│   └── package.json
│
├── database/                # Scripts SQL
│   └── schema.sql          # Estrutura completa do BD
│
├── README.md               # Documentação geral
├── SETUP.md               # Este arquivo
└── .gitignore
```

## 🚀 Comandos Úteis

```bash
# Rodar tudo junto (requer concurrently)
npm install -g concurrently
npm run dev

# Ou em terminais separados:
# Terminal 1:
cd backend && npm run dev

# Terminal 2:
cd frontend && npm start

# Limpar cache npm
npm cache clean --force

# Atualizar todas as dependências
npm update
```

## 📱 Testar no Celular/Outro PC

1. Descobrir IP da máquina: 
   - Windows: `ipconfig` (procurar IPv4)
   
2. Editar backend `.env`:
   ```
   CORS_ORIGIN=http://seu_ip:3000
   ```

3. Editar frontend `.env`:
   ```
   REACT_APP_API_URL=http://seu_ip:5000
   ```

4. Acessar pelo celular/outro PC:
   ```
   http://seu_ip:3000
   ```

## ✨ Recursos Implementados

- ✅ Autenticação com JWT
- ✅ Cadastro e login de usuários
- ✅ Carrinho de compras
- ✅ Checkout com várias formas de pagamento
- ✅ Filtros por categoria e preço
- ✅ Busca de produtos
- ✅ Seleção de tamanho e cor
- ✅ Gerenciamento de perfil
- ✅ Histórico de pedidos
- ✅ Interface responsiva (mobile-friendly)
- ✅ Bilíngue (Português e Inglês)
- ✅ Design moderno voltado para público feminino

## 📞 Suporte

Para problemas ou dúvidas:

1. Verificar a seção "Troubleshooting"
2. Consultar os logs do backend: `npm run dev`
3. Abrir console do navegador: F12
4. Revisar o README.md principal

## 🎓 Próximas Funcionalidades a Implementar

- Sistema de notificações por email
- Integração com gateway de pagamento real (Stripe/Mercado Pago)
- Avaliações e comentários de produtos
- Sistema de favoritos/wishlist
- Admin dashboard
- Sistema de cupons desconto
- Chat de suporte ao cliente

---

**Projeto criado com ❤️ para você!**

Aproveite e divirta-se! 🎉
