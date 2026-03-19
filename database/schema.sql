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

-- Inserir dados de exemplo
INSERT INTO produtos (id, nome, descricao, categoria, preco, tamanhos, cores, imagem, estoque) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'Sandália Feminina Rosa', 'Sandália confortável em tons rosa claro', 'Sandálias', 89.90, '33,34,35,36,37,38,39,40', 'Rosa,Nude', 'https://images.unsplash.com/photo-1528701800484-346abe03f320?auto=format&fit=crop&w=400&h=400&q=80', 50),
('550e8400-e29b-41d4-a716-446655440001', 'Sandália Plataforma Nude', 'Sandália com plataforma confortável', 'Sandálias', 99.90, '35,36,37,38,39,40', 'Bege,Branco', 'https://images.unsplash.com/photo-1515548211230-973d8fa6c24d?auto=format&fit=crop&w=400&h=400&q=80', 45),
('550e8400-e29b-41d4-a716-446655440002', 'Sandália Anabela Preta', 'Sandália anabela elegante para o dia a dia', 'Sandálias', 129.90, '35,36,37,38,39,40', 'Preto,Marrom', 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=400&h=400&q=80', 40),
('550e8400-e29b-41d4-a716-446655440003', 'Sandália Espadrille Estampada', 'Sandália com solado de corda e estampas vibrantes', 'Sandálias', 119.90, '35,36,37,38,39,40', 'Azul,Branco', 'https://images.unsplash.com/photo-1503341455253-b2e723bb3dbb?auto=format&fit=crop&w=400&h=400&q=80', 35),
('550e8400-e29b-41d4-a716-446655440004', 'Sandália Rasteira Cinza', 'Sandália rasteira casual para o dia a dia', 'Sandálias', 79.90, '34,35,36,37,38,39', 'Cinza,Preto', 'https://images.unsplash.com/photo-1552346157-742a8956167b?auto=format&fit=crop&w=400&h=400&q=80', 45),
('550e8400-e29b-41d4-a716-446655440005', 'Sandália Tratorada Preta', 'Sandália com solado grosso estilo tratorado', 'Sandálias', 139.90, '36,37,38,39,40', 'Preto', 'https://images.unsplash.com/photo-1520975918453-257d299264d9?auto=format&fit=crop&w=400&h=400&q=80', 30),
('550e8400-e29b-41d4-a716-446655440006', 'Sandália Gladiadora Caramelo', 'Sandália gladiadora com tiras ajustáveis', 'Sandálias', 129.90, '35,36,37,38,39,40', 'Caramelo,Marrom', 'https://images.unsplash.com/photo-1593032465176-39b7cfb1663f?auto=format&fit=crop&w=400&h=400&q=80', 40),
('550e8400-e29b-41d4-a716-446655440007', 'Sandália Birken Marrom', 'Sandália estilo birken com tiras confortáveis', 'Sandálias', 109.90, '36,37,38,39,40', 'Marrom', 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=400&h=400&q=80', 50),
('550e8400-e29b-41d4-a716-446655440008', 'Sandália de Salto Alto', 'Sandália com salto alto para ocasiões especiais', 'Sandálias', 159.90, '35,36,37,38,39,40', 'Preto,Vermelho', 'https://images.unsplash.com/photo-1523381294911-8d3cead13475?auto=format&fit=crop&w=400&h=400&q=80', 25),
('550e8400-e29b-41d4-a716-446655440009', 'Sandália Slide Dourada', 'Sandália slide com acabamento metalizado', 'Sandálias', 69.90, '34,35,36,37,38,39', 'Dourado,Prata', 'https://images.unsplash.com/photo-1525097487452-6278ff080c31?auto=format&fit=crop&w=400&h=400&q=80', 60);

-- Criar índices
CREATE INDEX idx_usuarios_email ON usuarios(email);
CREATE INDEX idx_produtos_categoria ON produtos(categoria);
CREATE INDEX idx_carrinhos_usuario ON carrinhos(usuario_id);
CREATE INDEX idx_pedidos_usuario ON pedidos(usuario_id);
