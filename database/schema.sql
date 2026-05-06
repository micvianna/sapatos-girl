-- Criar banco de dados
CREATE DATABASE sapatos_ecommerce;

-- Usar o banco de dados
\c sapatos_ecommerce;

-- Tabela de usuários
CREATE TABLE usuarios (
  id UUID PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  senha VARCHAR(255) NOT NULL,
  telefone VARCHAR(20),
  data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de produtos
CREATE TABLE produtos (
  id UUID PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  descricao TEXT,
  categoria VARCHAR(100),
  preco DECIMAL(10, 2) NOT NULL,
  tamanhos VARCHAR(50),
  cores VARCHAR(255),
  imagem VARCHAR(500),
  imagens JSON,
  estoque INT DEFAULT 0,
  avaliacao DECIMAL(3, 2) DEFAULT 0,
  ativo BOOLEAN DEFAULT true,
  data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de carrinhos
CREATE TABLE carrinhos (
  id UUID PRIMARY KEY,
  usuario_id UUID NOT NULL REFERENCES usuarios(id),
  ativo BOOLEAN DEFAULT true,
  data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de itens do carrinho
CREATE TABLE itens_carrinho (
  id UUID PRIMARY KEY,
  carrinho_id UUID NOT NULL REFERENCES carrinhos(id),
  produto_id UUID NOT NULL REFERENCES produtos(id),
  quantidade INT NOT NULL,
  tamanho VARCHAR(50),
  cor VARCHAR(100),
  data_adicao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de pedidos
CREATE TABLE pedidos (
  id UUID PRIMARY KEY,
  usuario_id UUID NOT NULL REFERENCES usuarios(id),
  total DECIMAL(10, 2) NOT NULL,
  status VARCHAR(50) DEFAULT 'pendente',
  endereco VARCHAR(255) NOT NULL,
  cidade VARCHAR(100) NOT NULL,
  estado VARCHAR(50) NOT NULL,
  cep VARCHAR(10) NOT NULL,
  metodo_pagamento VARCHAR(50),
  data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de itens do pedido
CREATE TABLE itens_pedido (
  id UUID PRIMARY KEY,
  pedido_id UUID NOT NULL REFERENCES pedidos(id),
  produto_id UUID NOT NULL REFERENCES produtos(id),
  quantidade INT NOT NULL,
  preco_unitario DECIMAL(10, 2) NOT NULL,
  tamanho VARCHAR(50),
  cor VARCHAR(100)
);

-- Inserir dados de exemplo (40+ produtos de todas as categorias)
INSERT INTO produtos (id, nome, descricao, categoria, preco, tamanhos, cores, imagem, estoque) VALUES
-- Sandálias
('550e8400-e29b-41d4-a716-446655440010', 'Sandália Lua de Mel', 'Sandália leve com tiras de couro sintético', 'Sandálias', 89.90, '34,35,36,37,38,39', 'Rosa,Nude', 'https://images.unsplash.com/photo-1528701800484-346abe03f320?auto=format&fit=crop&w=400&h=400&q=80', 50),
('550e8400-e29b-41d4-a716-446655440011', 'Sandália Brisa do Mar', 'Sandália de salto plataforma com acabamento em palha', 'Sandálias', 99.90, '35,36,37,38,39,40', 'Bege,Branco', 'https://images.unsplash.com/photo-1515548211230-973d8fa6c24d?auto=format&fit=crop&w=400&h=400&q=80', 45),
('550e8400-e29b-41d4-a716-446655440012', 'Sandália Rosa Espelho', 'Sandália aberta com detalhamento em verniz', 'Sandálias', 109.90, '35,36,37,38,39,40', 'Rosa,Prata', 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=400&h=400&q=80', 40),
('550e8400-e29b-41d4-a716-446655440013', 'Sandália Duna Urbana', 'Sandália com salto anabela e tiras cruzadas', 'Sandálias', 119.90, '35,36,37,38,39,40', 'Azul,Branco', 'https://images.unsplash.com/photo-1503341455253-b2e723bb3dbb?auto=format&fit=crop&w=400&h=400&q=80', 35),
('550e8400-e29b-41d4-a716-446655440014', 'Sandália Verão Zen', 'Sandália rasteira com design minimalista', 'Sandálias', 79.90, '34,35,36,37,38,39', 'Cinza,Preto', 'https://images.unsplash.com/photo-1552346157-742a8956167b?auto=format&fit=crop&w=400&h=400&q=80', 45),
-- Botas
(gen_random_uuid(), 'Bota Chelsea Couro Legítimo', 'Bota Chelsea clássica em couro legítimo italiano, solado tratorado e elástico lateral.', 'Botas', 1290.00, '35,36,37,38,39,40', 'Preto,Marrom,Caramelo', 'https://images.unsplash.com/photo-1520639888713-7851133b1ed0?auto=format&fit=crop&q=80&w=800', 20),
(gen_random_uuid(), 'Bota Over the Knee Preta', 'Bota cano longo acima do joelho em couro soft, salto grosso 8cm e zíper traseiro.', 'Botas', 2100.00, '35,36,37,38,39,40', 'Preto', 'https://images.unsplash.com/photo-1608236445204-7132ff36ba2e?auto=format&fit=crop&q=80&w=800', 15),
(gen_random_uuid(), 'Bota Coturno Luxo', 'Coturno de luxo em couro vintage com cadarço frontal e fivela dourada.', 'Botas', 1590.00, '36,37,38,39,40', 'Preto,Marrom', 'https://images.unsplash.com/photo-1491553895911-0055eca6402d?auto=format&fit=crop&q=80&w=800', 25),
(gen_random_uuid(), 'Bota Cano Curto Fivela', 'Bota ankle boot com detalhe de fivela lateral e bico fino.', 'Botas', 1390.00, '35,36,37,38,39', 'Preto,Nude', 'https://images.unsplash.com/photo-1542831371-29b0f74f9713?auto=format&fit=crop&q=80&w=800', 18),
(gen_random_uuid(), 'Bota Western Couro', 'Bota estilo cowboy em couro legítimo com bordados artesanais e bico fino.', 'Botas', 1850.00, '35,36,37,38,39,40', 'Marrom,Caramelo', 'https://images.unsplash.com/photo-1520975918453-257d299264d9?auto=format&fit=crop&q=80&w=800', 12),
-- Scarpins
(gen_random_uuid(), 'Scarpin Bico Fino Preto', 'Scarpin clássico bico fino em couro laqueado, salto 10cm e palmilha acolchoada.', 'Scarpins', 890.00, '34,35,36,37,38,39', 'Preto,Vermelho,Nude', 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&q=80&w=800', 30),
(gen_random_uuid(), 'Scarpin Salto Anabela', 'Scarpin salto anabela revestido em palha natural com tiras finas.', 'Scarpins', 750.00, '35,36,37,38,39', 'Bege,Branco', 'https://images.unsplash.com/photo-1560343090-f0409e92791a?auto=format&fit=crop&q=80&w=800', 22),
(gen_random_uuid(), 'Scarpin Metalizado Prata', 'Scarpin metalizado em lamê prateado, salto stiletto 11cm.', 'Scarpins', 1100.00, '35,36,37,38,39', 'Prata,Dourado', 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=800', 15),
(gen_random_uuid(), 'Scarpin Peep Toe Vermelho', 'Scarpin peep toe em camurça vermelha com fivela dourada.', 'Scarpins', 950.00, '34,35,36,37,38,39', 'Vermelho,Preto', 'https://images.unsplash.com/photo-1596704017254-9b121068fb31?auto=format&fit=crop&q=80&w=800', 20),
-- Sapatilhas
(gen_random_uuid(), 'Sapatilha Ballet Rosa', 'Sapatilha estilo ballet em cetim rosê com fita de amarrar no tornozelo.', 'Sapatilhas', 490.00, '34,35,36,37,38,39', 'Rosa,Preto,Nude', 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&q=80&w=800', 35),
(gen_random_uuid(), 'Sapatilha Bico Quadrado', 'Sapatilha bico quadrado em couro macio com solado antiderrapante.', 'Sapatilhas', 390.00, '34,35,36,37,38,39,40', 'Preto,Branco,Caramelo', 'https://images.unsplash.com/photo-1614251055844-897aa82e1a61?auto=format&fit=crop&q=80&w=800', 40),
(gen_random_uuid(), 'Sapatilha Loafer Clássica', 'Loafer clássica em couro preto com detalhe de corrente dourada.', 'Sapatilhas', 680.00, '35,36,37,38,39', 'Preto,Marrom', 'https://images.unsplash.com/photo-1614251055844-897aa82e1a61?auto=format&fit=crop&q=80&w=800', 25),
-- Tênis
(gen_random_uuid(), 'Tênis Branco Couro Premium', 'Tênis branco em couro premium com solado chunky e palmilha ortopédica.', 'Tênis', 690.00, '35,36,37,38,39,40', 'Branco,Preto', 'https://images.unsplash.com/photo-1562183241-b937e95585b6?auto=format&fit=crop&q=80&w=800', 50),
(gen_random_uuid(), 'Tênis Esportivo Rose Gold', 'Tênis esportivo com detalhes rose gold e mesh respirável.', 'Tênis', 590.00, '35,36,37,38,39,40', 'Rosa,Branco,Cinza', 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&q=80&w=800', 45),
(gen_random_uuid(), 'Tênis Platform Chunky', 'Tênis platform com solado tratorado 5cm e cabedal mix de materiais.', 'Tênis', 780.00, '35,36,37,38,39', 'Branco,Preto,Rosa', 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?auto=format&fit=crop&q=80&w=800', 30),
-- Bolsas
(gen_random_uuid(), 'Bolsa Estruturada Top Handle', 'Bolsa estruturada top handle em couro legítimo com ferragem dourada.', 'Bolsas', 3200.00, 'Único', 'Preto,Branco,Vermelho', 'https://images.unsplash.com/photo-1584916201218-f4242ceb4809?auto=format&fit=crop&q=80&w=800', 10),
(gen_random_uuid(), 'Bolsa Transversal Acetinada', 'Bolsa transversal em cetim com corrente dourada e fecho click.', 'Bolsas', 1800.00, 'Único', 'Preto,Rosa,Prata', 'https://images.unsplash.com/photo-1591561954557-26941169b49e?auto=format&fit=crop&q=80&w=800', 15),
(gen_random_uuid(), 'Bolsa Tote Couro Legítimo', 'Bolsa tote grande em couro legítimo com alças duplas e bolso interno.', 'Bolsas', 2500.00, 'Único', 'Preto,Marrom,Caramelo', 'https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?auto=format&fit=crop&q=80&w=800', 12),
(gen_random_uuid(), 'Bolsa Clutch Strass Noite', 'Clutch de noite cravejada em strass com fecho magnético.', 'Bolsas', 1500.00, 'Único', 'Prata,Dourado,Preto', 'https://images.unsplash.com/photo-1563903530908-af12c9cc2f19?auto=format&fit=crop&q=80&w=800', 20),
-- Acessórios
(gen_random_uuid(), 'Cinto Couro Largo Fivela', 'Cinto largo em couro legítimo com fivela dourada dupla.', 'Acessórios', 450.00, 'PP,P,M,G,GG', 'Preto,Marrom', 'https://images.unsplash.com/photo-1624222247344-550fb60ae12f?auto=format&fit=crop&q=80&w=800', 40),
(gen_random_uuid(), 'Lenço Seda Estampado', 'Lenço quadrado em seda natural com estampa floral exclusiva.', 'Acessórios', 380.00, 'Único', 'Azul,Rosa,Verde', 'https://images.unsplash.com/photo-1602702654724-3518f53ce0e7?auto=format&fit=crop&q=80&w=800', 35),
(gen_random_uuid(), 'Óculos Escuros Aviador', 'Óculos estilo aviador com armação dourada e lentes degradê.', 'Acessórios', 890.00, 'Único', 'Dourado,Preto,Prata', 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&q=80&w=800', 25),
(gen_random_uuid(), 'Pulseira Corrente Ouro', 'Pulseira corrente em banho de ouro 18k com medalhão ATALAIA.', 'Acessórios', 590.00, 'Único', 'Dourado', 'https://images.unsplash.com/photo-1611930022073-b7a4ba5fcccd?auto=format&fit=crop&q=80&w=800', 50),
(gen_random_uuid(), 'Cachecol Cashmere Premium', 'Cachecol em cashmere 100% com acabamento franjado.', 'Acessórios', 780.00, 'Único', 'Preto,Cinza,Marinho', 'https://images.unsplash.com/photo-1601628828688-6b54d0f5f1d0?auto=format&fit=crop&q=80&w=800', 20);

-- Tabela de favoritos (wishlist)
CREATE TABLE wishlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  produto_id UUID NOT NULL REFERENCES produtos(id) ON DELETE CASCADE,
  data_adicao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(usuario_id, produto_id)
);

-- Criar índices
CREATE INDEX idx_usuarios_email ON usuarios(email);
CREATE INDEX idx_produtos_categoria ON produtos(categoria);
CREATE INDEX idx_carrinhos_usuario ON carrinhos(usuario_id);
CREATE INDEX idx_pedidos_usuario ON pedidos(usuario_id);
