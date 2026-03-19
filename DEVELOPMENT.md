# 🎯 Guia de Desenvolvimento e Customização

## 📐 Arquitetura do Projeto

### Stack Tecnológico

**Frontend:**
- React 18
- React Router DOM (navegação)
- Zustand (gerenciamento de estado)
- i18next (internacionalização)
- Axios (requisições HTTP)
- React Icons (ícones)

**Backend:**
- Node.js + Express
- PostgreSQL (banco de dados)
- JWT (autenticação)
- bcryptjs (hash de senhas)
- CORS (segurança)
- UUID (IDs únicos)

## 🎨 Customização de Cores/Tema

### Cores Principais (atualize em todos os arquivos .css):

```css
--primary: #ff1493;      /* Deep Pink */
--primary-light: #ff69b4; /* Hot Pink */
--text-dark: #333333;
--text-light: #666666;
--bg-light: #f9f9f9;
--border: #ddd;
```

### Arquivos CSS principais:
- `frontend/src/components/Header.css`
- `frontend/src/pages/Home.css`
- `frontend/src/components/ProductCard.css`

## 🛠️ Adicionar Novas Funcionalidades

### 1. Adicionar Novo Produto (Backend)

No `backend/database/schema.sql`:

```sql
INSERT INTO produtos (id, nome, descricao, categoria, preco, tamanhos, cores, imagem, estoque)
VALUES (
  gen_random_uuid(),
  'Nome do Sapato',
  'Descrição',
  'Categoria',
  199.90,
  '33,34,35,36',
  'Cor1,Cor2',
  'url_da_imagem',
  50
);
```

### 2. Adicionar Nova Rota na API

1. Criar novo arquivo em `backend/src/routes/novo_recurso.js`
2. Implementar endpoints
3. Importar em `backend/src/server.js`

Exemplo:
```javascript
const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.json({ data: 'seu_dado' });
});

module.exports = router;
```

### 3. Adicionar Nova Página no Frontend

1. Criar arquivo em `frontend/src/pages/NovaPagina.js`
2. Criar arquivo CSS `NovaPagina.css`
3. Adicionar rota em `frontend/src/App.js`
4. Adicionar link em `frontend/src/components/Header.js`

### 4. Adicionar Tradução

1. Editar `frontend/src/locales/pt-BR.json`
2. Editar `frontend/src/locales/en-US.json`
3. Usar no componente:

```javascript
import { useTranslation } from 'react-i18next';

const { t } = useTranslation();
// Use: t('chave.subchave')
```

## 📊 Fluxo de Dados

```
Usuario
   ↓
Frontend (React)
   ↓
API (Express)
   ↓
Banco de Dados (PostgreSQL)
```

## 🔒 Segurança

### Autenticação:
1. Usuário faz login
2. Backend valida credenciais
3. Retorna JWT token
4. Frontend armazena no localStorage
5. Todas as requisições incluem token no header

### Header de Autenticação:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

## 🧪 Testando Endpoints

### Usando cURL:

```bash
# Registrar usuário
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "Maria Silva",
    "email": "maria@teste.com",
    "senha": "123456"
  }'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "maria@teste.com",
    "senha": "123456"
  }'

# Listar produtos
curl http://localhost:5000/api/products
```

### Usando Postman/Insomnia:

1. Importar collection (criar manualmente ou exportar endpoints)
2. Criar ambiente local
3. Testar cada endpoint

## 📈 Escalabilidade

### Para versão de produção:

1. **Banco de dados:**
   - Criar backups periódicos
   - Implementar índices adicionais
   - Considerar replicação

2. **Backend:**
   - Usar gerenciador de cache (Redis)
   - Implementar rate limiting
   - Adicionar logging estruturado

3. **Frontend:**
   - Build otimizado
   - Code splitting
   - Lazy loading de images

4. **Deploy:**
   - Docker containerization
   - CI/CD pipeline
   - Monitoramento e alertas

## 🐛 Debug

### Backend:
```javascript
// Adicionar logs
console.log('Variável:', variável);
console.error('Erro:', erro);

// Usar debugger
// Rodar com: node --inspect src/server.js
```

### Frontend:
```javascript
// Console browser
console.log, console.warn, console.error

// React DevTools extension
// Redux DevTools extension (adicione Zustand DevTools)
```

## 📋 Padrões de Código

### Backend:
- Use async/await
- Sempre trate erros com try/catch
- Valide inputs
- Use middleware para código repetido

### Frontend:
- Use functional components com hooks
- Custom hooks para lógica compartilhada
- Props validation com PropTypes
- Componentes pequenos e reutilizáveis

## 🚀 Performance

### Backend:
```javascript
// Query índices
SELECT * FROM produtos WHERE categoria = $1 AND ativo = true;
// Usar prepared statements está pronto

// Connection pooling está configurado
const pool = new Pool();
```

### Frontend:
- Memoização com React.memo
- useCallback/useMemo para otimização
- Lazy loading de imagens
- Code splitting por rota

## 📚 Recursos Úteis

- [Express.js Docs](https://expressjs.com/)
- [React Docs](https://react.dev/)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)
- [JWT.io](https://jwt.io/)
- [i18next Docs](https://www.i18next.com/)

## 🤝 Contribuindo

1. Criar branch: `git checkout -b feature/minha-feature`
2. Fazer commits: `git commit -m 'Add minha feature'`
3. Push: `git push origin feature/minha-feature`
4. Abrir Pull Request

## 📝 Convenções de Código

### Nomes:
- Variáveis: camelCase
- Componentes: PascalCase
- Constantes: UPPER_SNAKE_CASE
- Pastas: lowercase

### Comentários:
```javascript
// Para comentários simples

/**
 * Para functions e componentes
 * @param {type} name - descrição
 * @returns {type} descrição
 */
```

---

Sucesso no desenvolvimento! 🎉
