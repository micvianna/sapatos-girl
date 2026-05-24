# Atalaia Quality Review — Correção de 16 Problemas

> **Para execução agentic:** Use `superpowers:subagent-driven-development` (recomendado) ou `superpowers:executing-plans` para implementar este plano task-by-task.

**Objetivo:** Corrigir os 16 problemas críticos/importantes identificados no Relatório Atalaia Quality Review e remover código antigo.

**Arquitetura:** Correções em 4 camadas — (1) segurança/envvars, (2) banco de dados, (3) backend (routes), (4) frontend (componentes/páginas) — com verificação de código legado no final.

**Tech Stack:** Node.js/Express, React, PostgreSQL, JWT, bcrypt

---

## Status de Correções (antes do plano)

✅ **Já Corrigidos:**
- JWT_SECRET sem fallback inseguro (adminAuth.js:12)
- Password reset com token de uso único seguro (auth.js:105-150)
- CORS restrito por ambiente (server.js:16-30)
- Soft-delete em admin (admin.js:99, DELETE → UPDATE deleted_at)
- Schema cupons alinhado (coupons.js:24-39 usa campos reais: expiracao, desconto, tipo)
- Proteções contra auto-remoção e último admin (admin.js:34-95)
- Navegação SPA com NavLink (Header.js:84-88)

⚠️ **Ainda Precisam de Ajustes:**
1. Logs com PII (migrate_admin.js:50-51)
2. Acessibilidade: hero sem alt text (Home.css:89)
3. Acessibilidade: botão wishlist pequeno (ProductCard.css:33-44)
4. URL hardcoded em Login (Login.js:25)
5. Regras de negócio duplicadas (isGrandeSP, desconto Pix em orders.js + Checkout.js)
6. Funções muito grandes (Checkout.js:27-320 ~300 linhas)
7. Falta de testes unitários para auth, admin, coupons, orders
8. Verificar se há código antigo legado no projeto

---

## Archivos e Responsabilidades

### Backend
- `backend/src/server.js` — Configuração, validação de env vars
- `backend/src/config/validateEnv.js` — Validação centralizada de variáveis
- `backend/src/routes/auth.js` — Autenticação, JWT, reset de senha
- `backend/src/routes/admin.js` — Gerenciamento de usuários
- `backend/src/routes/orders.js` — Lógica de pedidos, regras de negócio
- `backend/src/routes/coupons.js` — Validação e aplicação de cupons
- `backend/src/utils/businessRules.js` — **NOVO** — Centralizar regras (isGrandeSP, etc)
- `backend/migrate_admin.js` — Scripts de migração/seed (remover logs com PII)
- `backend/.env.example` — Documentação de vars obrigatórias

### Frontend
- `frontend/src/pages/Home.js` — Hero com alt text
- `frontend/src/pages/Home.css` — Hero acessível
- `frontend/src/pages/Checkout.js` — Refatorar em subcomponentes + usar utils
- `frontend/src/pages/Login.js` — Usar REACT_APP_API_URL
- `frontend/src/components/ProductCard.js` — Ajustar tamanho do botão wishlist
- `frontend/src/components/ProductCard.css` — Mínimo 44x44px no target
- `frontend/src/utils/businessRules.js` — **NOVO** — Helpers de regras (isGrandeSP, buildEnderecoCompleto, etc)
- `frontend/src/config/api.js` — **NOVO** — Centralizar API_URL

### Testes
- `backend/test/auth.test.js` — **NOVO** — Testes JWT, register, login, reset
- `backend/test/admin.test.js` — **NOVO** — Testes CRUD admin
- `backend/test/coupons.test.js` — **NOVO** — Testes validação cupons
- `backend/test/orders.test.js` — **NOVO** — Testes regras de negócio

---

## Tarefas

### Task 1: Validação de Variáveis de Ambiente

**Arquivos:**
- Criar: `backend/src/config/validateEnv.js`
- Modificar: `backend/src/server.js` (já tem validação, apenas confirmar)
- Modificar: `backend/.env.example`

- [ ] **Passo 1: Verificar conteúdo atual de server.js**

Confirmar que `validateEnv()` está sendo chamado na linha 9-10 de `server.js`.

- [ ] **Passo 2: Criar arquivo de validação centralizado**

```javascript
// backend/src/config/validateEnv.js
function validateEnv() {
  const required = [
    'DB_HOST',
    'DB_PORT',
    'DB_NAME',
    'DB_USER',
    'DB_PASSWORD',
    'JWT_SECRET',
    'NODE_ENV'
  ];

  const missing = required.filter(key => !process.env[key]);

  if (missing.length > 0) {
    console.error('❌ Variáveis de ambiente obrigatórias faltando:', missing);
    process.exit(1);
  }

  console.log('✅ Todas as variáveis de ambiente validadas');
}

module.exports = validateEnv;
```

- [ ] **Passo 3: Verificar se server.js chama validateEnv()**

Confirmar que linha 9-10 de `server.js` tem:
```javascript
const validateEnv = require('./config/validateEnv');
validateEnv();
```

- [ ] **Passo 4: Atualizar .env.example**

```bash
# backend/.env.example
DB_HOST=localhost
DB_PORT=5432
DB_NAME=sapatos_ecommerce
DB_USER=postgres
DB_PASSWORD=seu_password_aqui
JWT_SECRET=sua_chave_secreta_forte_aqui_minimo_32_chars
JWT_EXPIRE=7d
NODE_ENV=development
PORT=5000
CORS_ORIGIN=http://localhost:3000
```

- [ ] **Passo 5: Commit**

```bash
git add backend/src/config/validateEnv.js backend/.env.example backend/src/server.js
git commit -m "fix: centralizar validação de variáveis de ambiente obrigatórias"
```

---

### Task 2: Remover Logs com PII em migrate_admin.js

**Arquivos:**
- Modificar: `backend/migrate_admin.js:50-51`

- [ ] **Passo 1: Ler o arquivo atual**

```bash
head -60 backend/migrate_admin.js
```

- [ ] **Passo 2: Remover logs que expõem nome/email do admin**

Substituir logs de PII por IDs opacos:

```javascript
// ANTES:
console.log(`Admin criado: ${adminName} (${adminEmail})`);

// DEPOIS:
console.log(`✅ Admin criado com sucesso (ID: ${adminId})`);
```

- [ ] **Passo 3: Commit**

```bash
git add backend/migrate_admin.js
git commit -m "fix(security): remover logs com PII (email/nome) em migrate_admin"
```

---

### Task 3: Centralizar Regras de Negócio (Backend)

**Arquivos:**
- Criar: `backend/src/utils/businessRules.js`
- Modificar: `backend/src/routes/orders.js` (usar funções do utils)

- [ ] **Passo 1: Criar arquivo de regras reutilizáveis**

```javascript
// backend/src/utils/businessRules.js

/**
 * RN04: Desconto para São Paulo Grande (SP)
 * Mesmo-dia se pedido antes do meio-dia
 */
function isGrandeSP(estado, cidade) {
  const grandeSPCities = [
    'São Paulo', 'Guarulhos', 'Osasco', 'Santo André',
    'São Bernardo do Campo', 'Diadema', 'Mauá', 'Ribeirão Pires'
  ];
  return estado?.toUpperCase() === 'SP' && grandeSPCities.includes(cidade);
}

/**
 * RN02: Desconto Pix de 5%
 */
function calcPixDiscount(total, paymentMethod) {
  if (paymentMethod?.toUpperCase() === 'PIX') {
    return { discountPercent: 5, discountValue: total * 0.05 };
  }
  return { discountPercent: 0, discountValue: 0 };
}

/**
 * RN06: Validação anti-fraude para primeira compra com cartão
 */
async function validateFirstPurchaseCard(userId, paymentMethod, pool) {
  if (paymentMethod?.toUpperCase() !== 'CARTAO') {
    return { isValid: true, status: null };
  }

  const orderCount = await pool.query(
    'SELECT COUNT(*) FROM pedidos WHERE usuario_id = $1 AND metodo_pagamento = $2',
    [userId, 'CARTAO']
  );

  const hasCardOrders = parseInt(orderCount.rows[0].count) > 0;
  if (!hasCardOrders) {
    return { isValid: true, status: 'em_analise' }; // Primeira compra com cartão
  }
  return { isValid: true, status: null };
}

module.exports = {
  isGrandeSP,
  calcPixDiscount,
  validateFirstPurchaseCard
};
```

- [ ] **Passo 2: Atualizar orders.js para usar as funções**

Em `backend/src/routes/orders.js`, substituir lógica inline pelas funções:

```javascript
const { isGrandeSP, calcPixDiscount, validateFirstPurchaseCard } = require('../utils/businessRules');

// ... em router.post('/criar', ...)
const { estado, cidade } = req.body;
const metodo_pagamento = req.body.metodo_pagamento || 'CARTAO';

const isSameDayEligible = isGrandeSP(estado, cidade);
const { discountPercent, discountValue } = calcPixDiscount(subtotal, metodo_pagamento);
const antifraud = await validateFirstPurchaseCard(userId, metodo_pagamento, pool);
```

- [ ] **Passo 3: Commit**

```bash
git add backend/src/utils/businessRules.js backend/src/routes/orders.js
git commit -m "refactor: centralizar regras de negócio (RN02, RN04, RN06) em utils"
```

---

### Task 4: Centralizar API URL no Frontend

**Arquivos:**
- Criar: `frontend/src/config/api.js`
- Modificar: `frontend/src/pages/Login.js`
- Modificar: `frontend/src/pages/Home.js`
- Modificar: qualquer outro arquivo que use `http://localhost:5000`

- [ ] **Passo 1: Criar arquivo de configuração de API**

```javascript
// frontend/src/config/api.js
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export default API_URL;
```

- [ ] **Passo 2: Atualizar Login.js**

Em `frontend/src/pages/Login.js`, substituir:

```javascript
// ANTES:
const response = await axios.post('http://localhost:5000/api/auth/login', ...);

// DEPOIS:
import API_URL from '../config/api';
const response = await axios.post(`${API_URL}/api/auth/login`, ...);
```

- [ ] **Passo 3: Verificar e atualizar Home.js e outros**

Procurar por `http://localhost:5000` em todos os arquivos:

```bash
grep -r "http://localhost:5000" frontend/src --include="*.js"
```

Substituir todas as ocorrências por:
```javascript
import API_URL from '../config/api';
// Use: `${API_URL}/api/...`
```

- [ ] **Passo 4: Commit**

```bash
git add frontend/src/config/api.js frontend/src/pages/Login.js frontend/src/pages/Home.js
git commit -m "refactor: centralizar API_URL em config/api.js"
```

---

### Task 5: Melhorar Acessibilidade - Hero Image Alt Text

**Arquivos:**
- Modificar: `frontend/src/pages/Home.js` (adicionar imagem com alt text)
- Modificar: `frontend/src/pages/Home.css` (remover background-image ou mover para img)

- [ ] **Passo 1: Verificar estrutura atual de Home.js**

```bash
grep -A 20 "className=\"hero" frontend/src/pages/Home.js
```

- [ ] **Passo 2: Refatorar hero para incluir img com alt text**

Em `frontend/src/pages/Home.js`, adicionar uma imagem verdadeira com alt:

```javascript
<section className="hero">
  <img 
    src="/hero-image.jpg" 
    alt="Mulheres em sapatos Atalaia Premium" 
    className="hero-image"
  />
  <div className="hero-overlay">
    <h2 className="hero-title">{t('home.heroTitle')}</h2>
    <p className="hero-subtitle">{t('home.heroSubtitle')}</p>
  </div>
</section>
```

- [ ] **Passo 3: Atualizar Home.css**

```css
.hero {
  position: relative;
  height: 500px;
  overflow: hidden;
}

.hero-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.hero-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.3);
  color: white;
}
```

- [ ] **Passo 4: Commit**

```bash
git add frontend/src/pages/Home.js frontend/src/pages/Home.css
git commit -m "fix(a11y): adicionar alt text descritivo ao hero image"
```

---

### Task 6: Melhorar Acessibilidade - Botão Wishlist

**Arquivos:**
- Modificar: `frontend/src/components/ProductCard.css` (garantir 44x44px)
- Modificar: `frontend/src/components/ProductCard.js` (aria-label, sempre visível)

- [ ] **Passo 1: Verificar tamanho atual do botão**

```bash
grep -A 10 "wishlist" frontend/src/components/ProductCard.css
```

- [ ] **Passo 2: Atualizar ProductCard.css para 44x44px mínimo**

```css
.product-card-actions {
  display: flex;
  gap: 8px;
  margin-top: 12px;
}

.wishlist-btn {
  width: 44px;
  height: 44px;
  min-width: 44px;
  min-height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  background: transparent;
  border: 1px solid #e5dfd5;
  cursor: pointer;
  transition: all 200ms cubic-bezier(0.25, 0.46, 0.45, 0.94);
  opacity: 1; /* Sempre visível */
  position: relative; /* Não usar hover para esconder */
}

.wishlist-btn:hover {
  background: #f5f1ea;
  border-color: #c9a961;
}
```

- [ ] **Passo 3: Adicionar aria-label em ProductCard.js**

```javascript
<button 
  className="wishlist-btn"
  onClick={() => toggleWishlist(product.id)}
  aria-label={isFavorited ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
>
  <FiHeart fill={isFavorited ? 'currentColor' : 'none'} />
</button>
```

- [ ] **Passo 4: Commit**

```bash
git add frontend/src/components/ProductCard.css frontend/src/components/ProductCard.js
git commit -m "fix(a11y): garantir botão wishlist 44x44px e sempre visível"
```

---

### Task 7: Refatorar Checkout em Subcomponentes

**Arquivos:**
- Criar: `frontend/src/components/CheckoutForm.js` (~150 linhas)
- Criar: `frontend/src/components/CheckoutSummary.js` (~100 linhas)
- Criar: `frontend/src/utils/businessRules.js` (duplicata do backend com mesma lógica)
- Modificar: `frontend/src/pages/Checkout.js` (reduzir para ~150 linhas, usar subcomponentes)

- [ ] **Passo 1: Criar utility de regras de negócio (frontend)**

```javascript
// frontend/src/utils/businessRules.js
export function isGrandeSP(estado, cidade) {
  const grandeSPCities = [
    'São Paulo', 'Guarulhos', 'Osasco', 'Santo André',
    'São Bernardo do Campo', 'Diadema', 'Mauá', 'Ribeirão Pires'
  ];
  return estado?.toUpperCase() === 'SP' && grandeSPCities.includes(cidade);
}

export function calcPixDiscount(total) {
  return total * 0.05; // 5% de desconto
}

export function calcShippingFee(estado, cidade, subtotal) {
  if (subtotal > 200) return 0; // Frete grátis acima de R$200
  if (isGrandeSP(estado, cidade)) return 15; // R$15 para Grande SP
  return 25; // R$25 padrão
}
```

- [ ] **Passo 2: Criar CheckoutForm.js**

```javascript
// frontend/src/components/CheckoutForm.js
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

export default function CheckoutForm({ onSubmit }) {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    endereco: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: '',
    estado: '',
    cep: '',
    metodo_pagamento: 'CARTAO'
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="checkout-form">
      {/* Campos de endereço */}
      <div className="form-group">
        <label>{t('checkout.address')}</label>
        <input 
          type="text" 
          name="endereco" 
          value={formData.endereco}
          onChange={handleChange}
          required 
        />
      </div>
      {/* ... outros campos ... */}
    </form>
  );
}
```

- [ ] **Passo 3: Criar CheckoutSummary.js**

```javascript
// frontend/src/components/CheckoutSummary.js
import React from 'react';
import { calcPixDiscount } from '../utils/businessRules';

export default function CheckoutSummary({ items, subtotal, discount, shipping, paymentMethod }) {
  const pixDiscount = paymentMethod === 'PIX' ? calcPixDiscount(subtotal) : 0;
  const total = subtotal - pixDiscount - discount + shipping;

  return (
    <div className="checkout-summary">
      <h3>Resumo do Pedido</h3>
      <div className="summary-line">
        <span>Subtotal:</span>
        <span>R$ {subtotal.toFixed(2)}</span>
      </div>
      {pixDiscount > 0 && (
        <div className="summary-line discount">
          <span>Desconto Pix (5%):</span>
          <span>-R$ {pixDiscount.toFixed(2)}</span>
        </div>
      )}
      {/* ... outras linhas ... */}
      <div className="summary-line total">
        <span>Total:</span>
        <span>R$ {total.toFixed(2)}</span>
      </div>
    </div>
  );
}
```

- [ ] **Passo 4: Refatorar Checkout.js**

Reduzir `/frontend/src/pages/Checkout.js` para ~150 linhas usando os subcomponentes:

```javascript
// frontend/src/pages/Checkout.js
import React, { useState } from 'react';
import CheckoutForm from '../components/CheckoutForm';
import CheckoutSummary from '../components/CheckoutSummary';
import { useCartStore } from '../store';
import { isGrandeSP, calcShippingFee } from '../utils/businessRules';

export default function Checkout() {
  const { items } = useCartStore();
  const [formData, setFormData] = useState(null);

  const subtotal = items.reduce((sum, item) => sum + (item.preco * item.quantidade), 0);
  const shipping = formData ? calcShippingFee(formData.estado, formData.cidade, subtotal) : 0;

  const handleFormSubmit = async (data) => {
    setFormData(data);
    // ... criar pedido ...
  };

  return (
    <div className="checkout-page">
      <CheckoutForm onSubmit={handleFormSubmit} />
      <CheckoutSummary 
        items={items}
        subtotal={subtotal}
        shipping={shipping}
        paymentMethod={formData?.metodo_pagamento}
      />
    </div>
  );
}
```

- [ ] **Passo 5: Commit**

```bash
git add frontend/src/components/CheckoutForm.js frontend/src/components/CheckoutSummary.js frontend/src/utils/businessRules.js frontend/src/pages/Checkout.js
git commit -m "refactor: dividir Checkout em subcomponentes e extrair regras de negócio"
```

---

### Task 8: Adicionar Testes Unitários (Backend)

**Arquivos:**
- Criar: `backend/test/auth.test.js`
- Criar: `backend/test/admin.test.js`
- Criar: `backend/test/coupons.test.js`
- Criar: `backend/test/businessRules.test.js`
- Modificar: `backend/package.json` (adicionar Jest/supertest)

- [ ] **Passo 1: Instalar dependências de teste**

```bash
cd backend
npm install --save-dev jest supertest @testing-library/node
npm pkg set scripts.test="jest --coverage"
npm pkg set scripts.test:watch="jest --watch"
```

- [ ] **Passo 2: Criar teste para businessRules.js**

```javascript
// backend/test/businessRules.test.js
const { isGrandeSP, calcPixDiscount } = require('../src/utils/businessRules');

describe('Business Rules', () => {
  describe('isGrandeSP', () => {
    it('deve retornar true para São Paulo e cidades da Grande SP', () => {
      expect(isGrandeSP('SP', 'São Paulo')).toBe(true);
      expect(isGrandeSP('SP', 'Guarulhos')).toBe(true);
    });

    it('deve retornar false para outros estados', () => {
      expect(isGrandeSP('RJ', 'Rio de Janeiro')).toBe(false);
    });

    it('deve retornar false para cidades não-Grande SP', () => {
      expect(isGrandeSP('SP', 'Campinas')).toBe(false);
    });
  });

  describe('calcPixDiscount', () => {
    it('deve aplicar 5% de desconto para Pix', () => {
      const result = calcPixDiscount(100, 'PIX');
      expect(result.discountValue).toBe(5);
      expect(result.discountPercent).toBe(5);
    });

    it('deve retornar 0 desconto para outros métodos', () => {
      const result = calcPixDiscount(100, 'CARTAO');
      expect(result.discountValue).toBe(0);
    });
  });
});
```

- [ ] **Passo 3: Executar testes**

```bash
cd backend
npm test -- --coverage
```

Expected: All tests pass (PASS ✓)

- [ ] **Passo 4: Commit**

```bash
git add backend/test/businessRules.test.js backend/package.json
git commit -m "test: adicionar testes unitários para regras de negócio"
```

---

### Task 9: Verificar e Remover Código Antigo

**Arquivos:**
- Procurar em todo o projeto

- [ ] **Passo 1: Procurar por código comentado/obsoleto**

```bash
grep -r "// TODO" backend/src frontend/src --include="*.js"
grep -r "// FIXME" backend/src frontend/src --include="*.js"
grep -r "// DEPRECATED" backend/src frontend/src --include="*.js"
grep -r "/\*.*\*/" backend/src frontend/src --include="*.js" | head -20
```

- [ ] **Passo 2: Procurar por imports não utilizados**

```bash
# Backend
grep -r "const.*require" backend/src --include="*.js" | wc -l

# Frontend
grep -r "import" frontend/src --include="*.js" | grep -v "from '" | head -20
```

- [ ] **Passo 3: Procurar por rotas/funções antigas**

```bash
grep -r "legacy\|old\|antigo\|deprecated" backend/src frontend/src --include="*.js"
```

- [ ] **Passo 4: Remover código morto identificado**

Se encontrado código antigo/comentado, remover:

```bash
# Exemplo:
# git rm backend/src/routes/legacy-products.js
# git rm backend/src/middleware/oldAuth.js
```

- [ ] **Passo 5: Commit**

```bash
git add -A
git commit -m "refactor: remover código antigo, comentários obsoletos e imports não utilizados"
```

---

### Task 10: Verificação Final e Relatório

**Arquivos:**
- Nenhum (apenas verificação)

- [ ] **Passo 1: Executar linter (se configurado)**

```bash
cd frontend && npm run lint 2>/dev/null || echo "Linter não configurado"
```

- [ ] **Passo 2: Verificar se todos os problemas foram corrigidos**

Rodar checklist contra o relatório original (`docs/consertar.md`):

```
✅ JWT secret sem fallback inseguro
✅ Soft-delete em lugar de DELETE físico
✅ Schema cupons alinhado
✅ Password reset com token seguro
✅ Regras de negócio centralizadas
✅ Funções Checkout reduzidas
✅ Navegação SPA com NavLink
✅ Acessibilidade (hero alt text, botão 44x44)
✅ URL hardcoded → centralizado
✅ Logs sem PII
✅ Testes unitários adicionados
✅ Código antigo removido
```

- [ ] **Passo 3: Executar o servidor e testar manualmente**

```bash
# Terminal 1:
cd backend && npm run dev

# Terminal 2:
cd frontend && npm start
```

Verificar:
- Home carrega com hero image
- Produtos listam corretamente
- Checkout funciona sem erros
- Admin panel acessível (para admin)
- Login redireciona após sucesso

- [ ] **Passo 4: Commit final**

```bash
git add -A
git commit -m "docs: atualizar relatório de qualidade Atalaia com correções aplicadas"
```

---

## Checklist de Completude

- [ ] Task 1: Validação de env vars ✅
- [ ] Task 2: Remover logs com PII ✅
- [ ] Task 3: Centralizar regras de negócio (backend) ✅
- [ ] Task 4: Centralizar API URL (frontend) ✅
- [ ] Task 5: Hero image alt text ✅
- [ ] Task 6: Botão wishlist 44x44px ✅
- [ ] Task 7: Refatorar Checkout ✅
- [ ] Task 8: Testes unitários ✅
- [ ] Task 9: Remover código antigo ✅
- [ ] Task 10: Verificação final ✅

---

**Plano salvo em:** `docs/superpowers/plans/2026-05-06-atalaia-quality-fixes.md`

Próximo passo: Escolher método de execução
