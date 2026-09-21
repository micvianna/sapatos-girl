README.md

# ShoeStyle - E-commerce de Sapatos Femininos 👠

Projeto completo de e-commerce para venda de sapatos femininos com design moderno e responsivo.

## 🎨 Características

- ✅ **Interface Moderna**: Design elegante voltado para público feminino
- ✅ **Bilíngue**: Português e Inglês (i18n)
- ✅ **Sistema de Autenticação**: Cadastro e login de usuários
- ✅ **Carrinho de Compras**: Gerenciamento completo de itens
- ✅ **Checkout Completo**: Processo de pagamento implementado
- ✅ **Banco de Dados**: PostgreSQL com schema completo
- ✅ **API RESTful**: Backend em Node.js/Express
- ✅ **Responsive Design**: Compatível com dispositivos móveis

## 📁 Estrutura do Projeto

```
testes_atalaia/
├── backend/          # API Node.js/Express
│   ├── src/
│   │   ├── server.js
│   │   ├── middleware/
│   │   └── routes/
│   ├── package.json
│   └── .env.example
├── frontend/         # React App
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── store/
│   │   ├── locales/
│   │   └── App.js
│   └── package.json
└── database/         # SQL scripts
    └── schema.sql
```

## 🚀 Como Começar

### Pré-requisitos

- Node.js 16+
- PostgreSQL 12+
- npm ou yarn

### 1. Configurar Banco de Dados

```bash
# Conectar ao PostgreSQL
psql -U postgres

# Executar o schema
\i database/schema.sql
```

### 2. Configurar Backend

```bash
cd backend

# Instalar dependências
npm install

# Criar arquivo .env
cp .env.example .env

# Preencher variáveis de ambiente
# DB_HOST, DB_USER, DB_PASSWORD, etc.

# Iniciar servidor
npm run dev
```

O backend estará disponível em `http://localhost:5000`

### 3. Configurar Frontend

```bash
cd frontend

# Instalar dependências
npm install

# Criar arquivo .env
echo "REACT_APP_API_URL=http://localhost:5000" > .env

# Iniciar aplicação
npm start
```

O frontend estará disponível em `http://localhost:3000`

## 🔐 Autenticação

O sistema usa JWT (JSON Web Tokens) para autenticação:

- **Registro**: POST `/api/auth/register`
- **Login**: POST `/api/auth/login`
- **Token válido por**: 7 dias

## 🛍️ Endpoints da API

### Autenticação
- `POST /api/auth/register` - Criar nova conta
- `POST /api/auth/login` - Login de usuário

### Produtos
- `GET /api/products` - Listar todos os produtos
- `GET /api/products/:id` - Get um produto específico

### Carrinho
- `GET /api/cart` - Ver carrinho
- `POST /api/cart/adicionar` - Adicionar ao carrinho
- `PUT /api/cart/:itemId` - Atualizar quantidade
- `DELETE /api/cart/:itemId` - Remover do carrinho

### Pedidos
- `POST /api/orders/criar` - Criar novo pedido
- `GET /api/orders` - Listar pedidos do usuário

### Usuário
- `GET /api/users/perfil` - Obter perfil
- `PUT /api/users/perfil` - Atualizar perfil

## 🌐 Idiomas Suportados

- 🇧🇷 Português Brasileiro (pt-BR)
- 🇺🇸 English (en-US)

Acesse o seletor de idioma no header para trocar entre idiomas.

## 🎨 Cores do Tema

- Primária: `#ff1493` (Deep Pink)
- Secundária: `#ff69b4` (Hot Pink)
- Texto: `#333333`
- Fundo: `#f9f9f9`

## 📱 Design Responsivo

- Desktop: 1200px+
- Tablet: 768px - 1199px
- Mobile: < 768px

## 🔒 Segurança

- Senhas com hash bcrypt
- JWT para autenticação
- CORS configurado
- SQL injection prevention com prepared statements

## 📦 Scripts Disponíveis

### Backend
```bash
npm start       # Iniciar servidor
npm run dev     # Iniciar com nodemon
npm test        # Executar testes
```

### Frontend
```bash
npm start       # Iniciar app em dev
npm build       # Criar build para produção
npm test        # Executar testes
```

## 🎯 Próximos Passos

- [ ] Integração com Stripe/Mercado Pago
- [ ] Sistema de favoritos
- [ ] Avaliações de produtos
- [ ] Admin dashboard
- [ ] Sistema de cupons
- [ ] Histórico de pedidos
- [ ] Notificações por email
- [ ] Testes automatizados

## 📝 Licença

Este projeto é de código aberto e disponível sob a MIT License.

## 👥 Contribuir

Contribuições são bem-vindas! Abra uma issue ou faça um pull request.

---

**ShoeStyle** - Onde o estilo encontra o conforto 👠✨
