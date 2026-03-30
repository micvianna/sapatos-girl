-- Seed: Tênis e Oxford - Dados copiados da Sonho dos Pés
-- Execute após o schema.sql: psql -d sapatos_ecommerce -f seed_tenis.sql

INSERT INTO produtos (id, nome, descricao, categoria, preco, tamanhos, cores, imagem, estoque, avaliacao, ativo) VALUES

-- TÊNIS LISTRA TEXTURIZADA
('660e8400-e29b-41d4-a716-446655440101', 'Tênis Listra Texturizada', 'Tênis com listras texturizadas em cores suaves. Conforto e estilo para o dia a dia.', 'Sapatos', 139.90, '34,35,36,37,38,39,40', 'Rosado,Verde Erva,Cotton', '/images/tenis/tenis-listra-texturizada-rosado.jpg', 30, 4.5, true),
('660e8400-e29b-41d4-a716-446655440102', 'Tênis Listra Texturizada', 'Tênis com listras texturizadas em tons neutros. Perfeito para composições sofisticadas.', 'Sapatos', 139.90, '34,35,36,37,38,39,40', 'Bege,Tequila,Marrom', '/images/tenis/tenis-listra-texturizada-bege.jpg', 28, 4.3, true),

-- TÊNIS CASUAL
('660e8400-e29b-41d4-a716-446655440103', 'Tênis Casual Branco/Camel', 'Tênis casual moderno com detalhes em camel. Ideal para looks descontraídos.', 'Sapatos', 119.90, '34,35,36,37,38,39', 'Branco,Camel', '/images/tenis/tenis-casual-branco-camel.jpg', 35, 4.6, true),
('660e8400-e29b-41d4-a716-446655440104', 'Tênis Casual Branco/Preto', 'Tênis casual clássico preto e branco. A combinação atemporal que nunca sai de moda.', 'Sapatos', 119.90, '34,35,36,37,38,39', 'Branco,Preto', '/images/tenis/tenis-casual-branco-preto.jpg', 40, 4.7, true),
('660e8400-e29b-41d4-a716-446655440105', 'Tênis Casual Cogumelo/Cotton', 'Tênis casual em tons terrosos. Sofisticação com conforto máximo.', 'Sapatos', 119.90, '34,35,36,37,38,39', 'Bege,Cinza', '/images/tenis/tenis-casual-cogumelo-cotton.jpg', 25, 4.4, true),
('660e8400-e29b-41d4-a716-446655440106', 'Tênis Casual Preto/Branco', 'Tênis casual urbano com design minimalista. Para quem ama praticidade.', 'Sapatos', 119.90, '34,35,36,37,38,39', 'Preto,Branco', '/images/tenis/tenis-casual-preto-branco.jpg', 38, 4.5, true),
('660e8400-e29b-41d4-a716-446655440107', 'Tênis Casual Branco/Niquel', 'Tênis casual com detalhes metalizados. Elegância descontraída para o dia a dia.', 'Sapatos', 179.90, '34,35,36,37,38', 'Branco,Prata', '/images/tenis/tenis-casual-branco-niquel.jpg', 22, 4.8, true),
('660e8400-e29b-41d4-a716-446655440108', 'Tênis Casual Branco/Mostarda/Rosado', 'Tênis casual colorido com combinação vibrante. Perfeito para quem ama cores.', 'Sapatos', 179.90, '34,35,36,37,38,39,40', 'Branco,Nude,Rosa', '/images/tenis/tenis-casual-branco-mostarda.jpg', 20, 4.2, true),

-- TÊNIS ROBERTA
('660e8400-e29b-41d4-a716-446655440109', 'Tênis Roberta Expresso/Cotton/Bronze', 'Tênis Roberta com mix de texturas em tons quentes. Design sofisticado e moderno.', 'Sapatos', 139.90, '34,35,36,37,38,39', 'Marrom,Bege,Dourado', '/images/tenis/tenis-roberta-expresso.jpg', 32, 4.6, true),

-- TÊNIS DANDARA
('660e8400-e29b-41d4-a716-446655440110', 'Tênis Dandara Branca', 'Tênis Dandara todo branco com design esportivo-chic. A peça coringa do guarda-roupa.', 'Sapatos', 199.90, '34,35,36,37,38,39,40', 'Branco', '/images/tenis/tenis-dandara-branca.jpg', 25, 4.9, true),
('660e8400-e29b-41d4-a716-446655440111', 'Tênis Dandara Preta', 'Tênis Dandara preto com acabamento premium. Estilo urbano e versátil.', 'Sapatos', 199.90, '34,35,36,37,38,39,40', 'Preto', '/images/tenis/tenis-dandara-preta.jpg', 28, 4.7, true),
('660e8400-e29b-41d4-a716-446655440112', 'Tênis Dandara Bege/Amêndoa', 'Tênis Dandara em tom nude sofisticado. Combina com tudo e eleva qualquer look.', 'Sapatos', 199.90, '34,35,36,37,38,39', 'Bege,Nude', '/images/tenis/tenis-dandara-bege-amendoa.jpg', 30, 4.5, true),
('660e8400-e29b-41d4-a716-446655440113', 'Tênis Dandara Sela', 'Tênis Dandara na cor sela. Tom terroso que traz sofisticação natural.', 'Sapatos', 199.90, '34,35,36,37,38,39,40', 'Caramelo,Marrom', '/images/tenis/tenis-dandara-sela.jpg', 18, 4.4, true),

-- TÊNIS MIX TEXTURAS
('660e8400-e29b-41d4-a716-446655440114', 'Tênis Mix Texturas Multicolor', 'Tênis com mix de texturas e cores vibrantes. A peça statement do momento.', 'Sapatos', 199.90, '34,35,36,37,38', 'Rosa,Bege,Cinza', '/images/tenis/tenis-mix-texturas-multicolor.jpg', 15, 4.8, true),
('660e8400-e29b-41d4-a716-446655440115', 'Tênis Mix Texturas Camel', 'Tênis com mix de texturas em tom camel. Elegância natural e moderna.', 'Sapatos', 199.90, '34,35,36,37,38,39,40', 'Camel,Marrom', '/images/tenis/tenis-mix-texturas-camel.jpg', 22, 4.6, true),
('660e8400-e29b-41d4-a716-446655440116', 'Tênis Mix Texturas Natural', 'Tênis com mix de texturas em tons naturais. Sofisticação discreta para o dia a dia.', 'Sapatos', 199.90, '34,35,36,37,38,39,40', 'Bege,Nude,Branco', '/images/tenis/tenis-mix-texturas-natural.jpg', 20, 4.7, true),

-- TÊNIS RYANE
('660e8400-e29b-41d4-a716-446655440117', 'Tênis Ryane Camel/Cotton', 'Tênis Ryane em camel com detalhes em cotton. Conforto premium com estilo moderno.', 'Sapatos', 179.90, '34,35,36,37,38,39,40', 'Camel,Bege', '/images/tenis/tenis-ryane-camel-cotton.jpg', 26, 4.5, true),
('660e8400-e29b-41d4-a716-446655440118', 'Tênis Ryane Cotton/Niquel/Preta', 'Tênis Ryane com detalhes metalizados. Design arrojado e contemporâneo.', 'Sapatos', 179.90, '34,35,36,37,38,39,40', 'Preto,Bege,Prata', '/images/tenis/tenis-ryane-cotton-niquel.jpg', 24, 4.3, true),

-- TÊNIS DEISY
('660e8400-e29b-41d4-a716-446655440119', 'Tênis Deisy Camel', 'Tênis Deisy em camel com acabamento artesanal. A cor da temporada em um design único.', 'Sapatos', 189.90, '34,35,36,37,38,39,40', 'Camel,Caramelo', '/images/tenis/tenis-deisy-camel.jpg', 30, 4.6, true),
('660e8400-e29b-41d4-a716-446655440120', 'Tênis Deisy Preta', 'Tênis Deisy preto com detalhes texturizados. Atitude e estilo em cada passo.', 'Sapatos', 189.90, '34,35,36,37,38,39,40', 'Preto', '/images/tenis/tenis-deisy-preta.jpg', 35, 4.8, true);
