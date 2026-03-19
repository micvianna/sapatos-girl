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
('550e8400-e29b-41d4-a716-446655440000', 'Sandália Feminina Rosa', 'Sandália confortável em tons rosa claro', 'Sandálias', 89.90, '33,34,35,36,37,38,39,40', 'Rosa,Nude', 'https://via.placeholder.com/300x300?text=Sandalia+Rosa', 50),
('550e8400-e29b-41d4-a716-446655440001', 'Tênis Branco Esportivo', 'Tênis branco esportivo ultra confortável', 'Tênis', 129.90, '33,34,35,36,37,38,39,40', 'Branco,Rosa', 'https://via.placeholder.com/300x300?text=Tenis+Branco', 40),
('550e8400-e29b-41d4-a716-446655440002', 'Scarpin Preto Elegante', 'Scarpin preto elegante para ocasiões especiais', 'Scarpins', 179.90, '33,34,35,36,37,38,39,40', 'Preto,Vermelho', 'https://via.placeholder.com/300x300?text=Scarpin+Preto', 30),
('550e8400-e29b-41d4-a716-446655440003', 'Bota Marrom Cano Longo', 'Bota marrom com cano longo e salto', 'Botas', 199.90, '33,34,35,36,37,38,39,40', 'Marrom,Preto', 'https://via.placeholder.com/300x300?text=Bota+Marrom', 25),
('550e8400-e29b-41d4-a716-446655440004', 'Sapatilha Cinza Casual', 'Sapatilha cinza para look casual', 'Sapatilhas', 99.90, '33,34,35,36,37,38,39,40', 'Cinza,Rosa,Preto', 'https://via.placeholder.com/300x300?text=Sapatilha+Cinza', 45);

-- Criar índices
CREATE INDEX idx_usuarios_email ON usuarios(email);
CREATE INDEX idx_produtos_categoria ON produtos(categoria);
CREATE INDEX idx_carrinhos_usuario ON carrinhos(usuario_id);
CREATE INDEX idx_pedidos_usuario ON pedidos(usuario_id);
