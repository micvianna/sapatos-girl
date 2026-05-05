# Atalaia Premium Redesign — Phase 1

**Date:** 2026-05-05  
**Scope:** Visual system + Home, Products (listagem), ProductDetail, Header/Footer, MiniCart Drawer  
**Target:** Editorial luxury aesthetic (Larroudé-inspired) with advanced e-commerce features  
**Phase 1 outcome:** Premium-looking site with full product browsing + filtering + cart interaction

---

## 1. Visual System

### Color Palette

| Token | Hex | Usage |
|-------|-----|-------|
| `--bg` | #F5F1EA | Primary background (body) |
| `--bg-elev` | #FFFFFF | Elevated surfaces (cards, drawer) |
| `--ink` | #0A0A0A | Primary text, main CTAs |
| `--ink-soft` | #4A4A4A | Secondary text, metadata |
| `--line` | #E5DFD5 | Borders, dividers |
| `--accent` | #6B1E2C | Bordô — sale badges, primary CTAs, links |
| `--gold` | #C9A961 | Champagne — "new" badges, micro-accents, hover states |
| `--success` | #2D5F3F | Positive actions (add to cart confirmation) |
| `--danger` | #8B2020 | Destructive actions, errors |

### Typography

```css
--font-display: 'Fraunces', 'Playfair Display', Georgia, serif;
--font-body: 'Inter', system-ui, sans-serif;
--font-mono: 'JetBrains Mono', monospace;
```

**Usage:**
- **Display font** (serif): Headlines (h1–h3), product names, hero text. Weight 600–700.
- **Body font** (sans): Paragraph text, metadata, UI labels. Weight 400–500.
- **Mono:** Code blocks, pricing, technical specs (rare on frontend).

### Type Scale (modular 1.25x)

```css
--text-xs:  12px;  --lh-xs:  1.4;
--text-sm:  14px;  --lh-sm:  1.5;
--text-base: 16px;  --lh-base: 1.6;
--text-lg:  20px;  --lh-lg:  1.6;
--text-xl:  25px;  --lh-xl:  1.5;
--text-2xl: 32px;  --lh-2xl: 1.4;
--text-3xl: 44px;  --lh-3xl: 1.3;
--text-4xl: 60px;  --lh-4xl: 1.2;
--text-5xl: 84px;  --lh-5xl: 1.1;
```

### Spacing (8pt grid)

```css
--s-1: 4px;
--s-2: 8px;
--s-3: 12px;
--s-4: 16px;
--s-5: 24px;
--s-6: 32px;
--s-8: 48px;
--s-10: 64px;
--s-12: 96px;
```

### Layout

```css
--container: 1440px;
--gutter: clamp(16px, 4vw, 64px);
```

### Animation

```css
--ease: cubic-bezier(0.25, 0.46, 0.45, 0.94);
--dur-fast: 200ms;
--dur: 400ms;
--dur-slow: 700ms;
```

**Keyframes:**
- `fadeIn`: opacity 0 → 1, duration `--dur`
- `slideInUp`: translate-y +20px → 0, duration `--dur`
- `hover-lift`: transform translateY(-4px), shadow increase, duration `--dur-fast`
- `shimmer`: (future: skeleton loaders)

---

## 2. Component Specs

### Header (refactor)

**Structure:**
```
┌─ Announcement Bar (sticky, bg --accent, text white)
│  └─ "Frete grátis acima de R$ 200" + close icon
├─ Main Header (sticky, bg --bg)
│  ├─ Logo "ATALAIA" (serif, --text-2xl, --ink)
│  ├─ Nav links (body font, --text-base)
│  │  ├─ Shoes
│  │  ├─ About
│  │  ├─ Contact
│  │  └─ FAQ
│  ├─ Right icons (search, account, cart)
│  └─ Language switcher (pt-BR, en-US, es) dropdown
└─ Mobile burger menu (responsive)
```

**Styling:**
- Border-bottom: 1px solid `--line`
- Padding: `--s-4` vertical, `--gutter` horizontal
- Links: hover color `--accent`, underline on hover (thin, 1px solid)

**Behavior:**
- Sticky when scrolling
- Logo clickable → home
- Search icon opens modal overlay (Phase 2)
- Cart icon shows mini-cart drawer on click
- Mobile: burger opens drawer with nav + language switcher

---

### Footer (refactor)

**Structure:**
```
┌─ Main footer (bg --ink, text white)
│  ├─ Column 1: Links (Shop, About, Contact, FAQ)
│  ├─ Column 2: Social (Instagram, TikTok, Pinterest)
│  ├─ Column 3: Newsletter signup (email input + submit)
│  └─ Column 4: Legal (Privacy, Terms, Returns)
├─ Sub-footer (bg --ink-soft, text white)
│  └─ Copyright + Payments accepted icons
```

**Styling:**
- Padding: `--s-10` vertical, `--gutter` horizontal
- Grid: 4 equal columns (responsive: 2 col tablet, 1 col mobile)
- Link hover: color `--gold`

---

### ProductCard (refactor + new features)

**Structure:**
```
┌─ Image container (aspect-ratio 3/4, overflow hidden)
│  ├─ Main image (swap on hover)
│  ├─ Badges overlay (top-right):
│  │  ├─ "NEW" (if product.isNew, bg --gold, text --ink, pill)
│  │  └─ "SALE" (if discount > 0, bg --accent, text white, pill)
│  └─ Quick-add button overlay (center, appears on hover)
│     └─ "Adicionar" button (bg --accent, text white, opacity 0 → 1 on hover)
├─ Product name (serif, --text-lg, --ink)
├─ Price section
│  ├─ Original price (if discount, --text-sm, strikethrough, --ink-soft)
│  └─ Final price (--text-lg, --accent if discount)
└─ Color swatches (3 max, circular, 20px diameter)
   ├─ Click swatch: changes main image + updates selected color
   └─ Active swatch: border 2px solid --gold
```

**Interactions:**
- Hover card: lift (+4px), shadow increases, second image swaps in, quick-add fades in
- Click card body: navigate to PDP
- Click quick-add: add to cart + open mini-cart drawer
- Click swatch: swap image + update color state

**Animations:**
- Hover-lift: `transform translateY(-4px)`, `box-shadow 0 12px 24px rgba(0,0,0,0.15)`, `--dur-fast`
- Image swap: fade cross-dissolve, `--dur-fast`
- Button appear: opacity 0 → 1, `--dur-fast`

---

### ProductCard Gallery (new component for PDP)

**Structure:**
```
┌─ Main image area (60% width on desktop)
│  ├─ Large image (zoomable on click)
│  ├─ Zoom modal (full-screen lightbox)
│  │  ├─ Large image + zoom controls (+/- buttons)
│  │  └─ Close button (X)
│  └─ Thumbnail carousel (vertical, sticky)
│     └─ 6 thumbnails, active highlighted (gold border)
└─ Interaction: click thumbnail → main image changes
```

**Styling:**
- Main image: aspect-ratio 1, object-fit cover
- Thumbnails: 80x80px, border-radius 4px, cursor pointer
- Active thumbnail: border 2px solid --gold
- Zoom: cursor zoom-in on image, lightbox bg black 0.8 opacity

**Animations:**
- Main image change: fade-in, `--dur-fast`
- Zoom modal: slide-up + fade, `--dur`

---

### Color Swatches (new component, reusable)

**Props:**
```javascript
{
  colors: [
    { id: 'red', name: 'Vermelho', hex: '#C1121F' },
    { id: 'black', name: 'Preto', hex: '#000000' },
    // ...
  ],
  onSelect: (colorId) => updateImage(colorId),
  selected: 'red'
}
```

**Rendering:**
- Circular pill (30px on PDP, 20px on card)
- Solid color background
- Border: 2px solid transparent, active → solid --gold
- Hover: border 1px solid --ink-soft (outline)
- Tooltip on hover: color name

---

### MiniCart Drawer (refactor to drawer pattern)

**Structure:**
```
┌─ Overlay (bg black, opacity 0.5, closes drawer on click)
└─ Drawer panel (slide-in from right, bg --bg-elev, width 400px on desktop)
   ├─ Header
   │  ├─ "Sua Sacola" (serif, --text-2xl)
   │  └─ Close button (X)
   ├─ Items list (scrollable, max-height)
   │  ├─ Per item:
   │  │  ├─ Image thumb (60x80px)
   │  │  ├─ Name + color + size (--text-sm)
   │  │  ├─ Price (--text-base, --accent if on sale)
   │  │  ├─ Qty +/- buttons
   │  │  └─ Trash icon (remove)
   │  └─ Empty state (if no items)
   ├─ Footer
   │  ├─ Subtotal line (--text-base, --ink-soft)
   │  ├─ CTA "Ir para Carrinho" (full-width, bg --accent, text white)
   │  └─ CTA "Continuar Comprando" (full-width outline, mt --s-2)
```

**Behavior:**
- Opens on click quick-add or add-to-cart button
- Updates Zustand cart state in real-time
- Close: X button, overlay click, or "Continuar Comprando"
- Qty +/-: updates state immediately
- Trash: removes item + animates out
- Navigate to `/cart` on "Ir para Carrinho"

**Animations:**
- Drawer slide: `translateX 100% → 0`, `--dur`
- Overlay fade: opacity 0 → 0.5, `--dur`
- Item remove: fade-out + slide-left, `--dur-fast`

---

### Filters Sidebar (new component for Products listing)

**Structure:**
```
┌─ Sticky sidebar (width 20% desktop, full on mobile modal)
├─ Header: "Filtros" + Clear button (outline --accent)
├─ Filter groups (collapsible on mobile)
│  ├─ Color filter
│  │  ├─ Checkboxes + color swatches preview
│  │  └─ Max 8 colors shown
│  ├─ Size filter
│  │  ├─ Checkboxes (33-43)
│  ├─ Price range filter
│  │  ├─ Dual-handle slider (min/max)
│  │  ├─ Input fields (R$ min, R$ max)
│  ├─ Sort dropdown
│  │  ├─ Relevância
│  │  ├─ Menor preço
│  │  ├─ Maior preço
│  │  └─ Mais recente
```

**Behavior:**
- Each filter updates URL params (`?color=red&size=38&priceMax=500`)
- URL params drive filter state (bookmarkable)
- Price slider: debounce 300ms before filtering
- Clear button: resets all filters + URL
- Mobile: filters in collapsible accordion or modal drawer

**Styling:**
- Border-right: 1px solid --line (desktop only)
- Padding: --s-6
- Checkboxes: custom styled (brand colors)
- Active checkbox: color --accent
- Slider: primary --accent, track --line

---

## 3. Page Specs

### Home

**Hero section:**
- Full-bleed 60vh, video or image background (parallax 0.5x on scroll)
- Overlay: `bg linear-gradient(135deg, rgba(107, 30, 44, 0.15), transparent)`
- Content centered:
  - Headline: "Elegância em cada passo" (serif, --text-5xl, white, max-width 800px)
  - Subheading: "Sapatos para mulheres que sabem o que querem" (body, --text-xl, white, opacity 0.9)
  - CTA button: "Descobrir coleção" (bg --accent, text white, large padding --s-5)
  - CTA hover: bg --gold, text --ink

**Sections (stacked vertically, fade-in on scroll):**

1. **Categorias Destaque** (3-col grid on desktop)
   - Card: image + overlay gradient (top-to-bottom) + category name (serif, white) + "Ver coleção" link (--gold)
   - Hover: image zoom 1.05x, link opacity increase

2. **Nova Coleção** (grid 4-col ProductCards)
   - Section title: "Nova Coleção" (serif, --text-3xl, --ink)
   - 8 ProductCards with all features (hover-swap, quick-add, swatches, badges)

3. **Brand story block** (image left, text right, alternating)
   - Image: 500x500px
   - Text: serif headline + body paragraph + link "Saiba mais"
   - Repeat 2x: "Sobre Atalaia", "Sustentabilidade"

4. **Newsletter signup** (full-width block, bg --ink, text white, centered)
   - Headline: "Fique por dentro" (serif, --text-2xl)
   - Email input + submit button (--accent, text white)
   - Message: "Receba 15% de desconto na sua primeira compra"

**Footer:** Standard footer component

---

### Products (Listagem)

**Layout:** 2-col (sidebar 20%, grid 80%)

**Left sidebar:** Filters component (sticky)

**Main grid:**
- ProductCard grid: 3-col desktop, 2-col tablet, 1-col mobile
- Cards fully featured (hover-swap, quick-add, badges, swatches)
- Infinite scroll OR pagination (TBD: choose based on DB perf)

**Top bar (above grid):**
- Results count: "XX produtos"
- Sort dropdown (moved from sidebar or duplicated)

---

### ProductDetail (PDP)

**Hero/Main content area:**

**Left column (60%):**
- Gallery component (main image + thumbnails, zoom lightbox)

**Right column (40%):**
- Breadcrumb: "Home > Shoes > [Product name]"
- Product name (serif, --text-3xl)
- Star rating + review count (Phase 2)
- Price section:
  - Original (strikethrough if discount)
  - Final (--accent if discount)
- Short description (--text-base, --ink-soft)
- Color swatches (large, 30px)
- Size selector (checkboxes, grid 2-col)
- Quantity selector (+/- buttons with input)
- CTA "Adicionar à sacola" (full-width, bg --accent, large padding)
- CTA "❤ Adicionar à wishlist" (full-width outline, mt --s-2)
- Trust badges (horizontal, 3 items):
  - "Frete grátis acima de R$ 200"
  - "Devolução em 14 dias"
  - "Garantia de autenticidade"
- Social share buttons (inline, subtle)

**Below fold:**

**Tabs (collapsible on mobile):**
1. **Descrição** — product.description (body text)
2. **Tamanho** — size guide table + fit notes
3. **Avaliações** — Phase 2

**FAQ section** — Common Q&A (material, care instructions, shipping)

**"Você pode gostar"** — 4 ProductCards (similar products) — Phase 2

---

## 4. Technical Architecture

### Directory Structure

```
frontend/src/
├── styles/
│   ├── tokens.css           [NEW] CSS variables (color, type, spacing, animation)
│   ├── global.css           [NEW] Reset + base styles (html, body, links, forms)
│   ├── animations.css       [NEW] @keyframes (fadeIn, slideInUp, hover-lift, etc)
│   └── [existing *.css files preserved]
├── components/
│   ├── Header.js            [REFACTOR] Announcement bar, nav, sticky
│   ├── Footer.js            [REFACTOR] Multi-column, social, newsletter
│   ├── ProductCard.js       [REFACTOR] Hover-swap, quick-add, swatches, badges
│   ├── Gallery.js           [NEW] Main + thumbnails + zoom lightbox
│   ├── ColorSwatches.js     [NEW] Reusable swatch component
│   ├── MiniCart.js          [REFACTOR] Drawer pattern with animations
│   ├── Filters.js           [NEW] Sidebar with color/size/price/sort
│   ├── AnnouncementBar.js   [NEW] Sticky top announcement
│   └── [...other components preserve existing]
├── pages/
│   ├── Home.js              [REFACTOR] Hero + sections with Intersection Observer
│   ├── Products.js          [REFACTOR] Sidebar + grid layout, URL params
│   ├── ProductDetail.js     [REFACTOR] New layout (gallery + specs), tabs
│   └── [...other pages minimal change]
├── hooks/
│   ├── useIntersectionObserver.js [NEW] For fade-in animations
│   └── useFilters.js        [NEW] Manage filter state + URL sync
└── [...existing store, i18n, etc preserved]
```

### State Management (Zustand)

**Minimal changes:**
- Cart store: add `miniCartOpen` boolean + `addToCart` already exists
- Products store: add `filters` object (color, size, priceMin/Max, sort)
- Add new hook `useFilters()` to sync URL params ↔ Zustand

**No backend changes.** All filtering client-side on fetched products.

### i18n Keys (add to existing locales)

```javascript
// Add to pt-BR, en-US, es locales
{
  // Header/Footer/Common
  "header.language": "Idioma",
  "header.search": "Buscar",
  "header.account": "Minha Conta",
  "header.cart": "Sacola",
  
  // Product card
  "badge.new": "NOVO",
  "badge.sale": "SALE",
  "button.addToCart": "Adicionar",
  "button.viewDetails": "Ver Detalhes",
  
  // Filters
  "filter.title": "Filtros",
  "filter.color": "Cor",
  "filter.size": "Tamanho",
  "filter.price": "Preço",
  "filter.sort": "Ordenar por",
  "filter.clear": "Limpar filtros",
  "filter.relevance": "Relevância",
  "filter.priceLow": "Menor preço",
  "filter.priceHigh": "Maior preço",
  "filter.newest": "Mais recente",
  
  // Mini-cart
  "cart.title": "Sua Sacola",
  "cart.empty": "Sua sacola está vazia",
  "cart.subtotal": "Subtotal",
  "cart.continueShopping": "Continuar Comprando",
  "cart.checkout": "Ir para Carrinho",
  
  // PDP
  "product.size": "Tamanho",
  "product.color": "Cor",
  "product.quantity": "Quantidade",
  "product.addToWishlist": "Adicionar à wishlist",
  "product.freeShipping": "Frete grátis acima de R$ 200",
  "product.returns": "Devolução em 14 dias",
  "product.guarantee": "Garantia de autenticidade",
  
  // Home
  "home.hero": "Elegância em cada passo",
  "home.discoverCollection": "Descobrir coleção",
  "home.newsletter": "Fique por dentro",
  "home.newsletterCTA": "Receba 15% de desconto na sua primeira compra"
}
```

---

## 5. Dependencies

**New packages:** None. Use existing:
- `framer-motion` (already installed) for animations
- `react-router-dom` (already installed) for URL params
- `zustand` (already installed) for state
- CSS Grid + Flexbox for layout
- CSS custom properties for tokens

---

## 6. Phase 2 Backlog

- Reviews/ratings (star + comments) on PDP
- "Complete o look" product carousel on PDP
- Newsletter pop-up modal with cupom
- Search modal with autocomplete
- Wishlist page
- Institutional pages (About, FAQ, Contact, Careers) individual design
- Related products algorithm (by category/tags)
- Performance: image optimization, lazy-loading
- Accessibility audit (a11y)

---

## 7. Success Criteria (Phase 1)

- [x] Design approved by user
- [ ] All components styled per tokens (no inline styles)
- [ ] Home renders with hero + sections, animations on scroll work
- [ ] Products page: filters work, URL persists, cards display correctly
- [ ] PDP: gallery zoom works, swatches swap images, layout is responsive
- [ ] MiniCart: drawer opens/closes, Zustand updates, animations smooth
- [ ] Header/Footer: sticky, responsive, nav works
- [ ] Mobile responsive (320px, 768px, 1440px tested)
- [ ] No console errors or warnings
- [ ] All existing functionality preserved (cart, checkout, auth, i18n)
- [ ] Git commit + pushed to `fix/atalaia-quality-review`

---

## 8. Notes

- **No breaking changes:** All refactors keep same props/exports. Zustand store schema unchanged.
- **Animations:** Use Intersection Observer for scroll-triggered fade-ins. framer-motion for drawer + hover.
- **Accessibility:** Semantic HTML, ARIA labels on interactive elements, keyboard nav on modals (Phase 2 audit).
- **Performance:** CSS Grid instead of Tailwind classes. No huge JS bundles added.
- **Future:** Phase 2 will add reviews, related products, search, and institutional pages. Phase 3 could explore micro-interactions (scroll parallax, spring animations, drag-to-reorder cart).
