const { Pool } = require('pg');
require('dotenv').config({ path: './.env' });

const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'sapatos_ecommerce',
    password: process.env.DB_PASSWORD || 'postgres',
    port: process.env.DB_PORT || 5432,
});

const products = [
  // ===== BOTAS =====
  { nome: "Bota Chelsea Couro Legítimo", descricao: "Bota Chelsea clássica em couro legítimo italiano, solado tratorado e elástico lateral.", categoria: "Botas", preco: 1290.00, tamanhos: "35,36,37,38,39,40", cores: "Preto,Marrom,Caramelo", imagem: "https://images.unsplash.com/photo-1520639888713-7851133b1ed0?auto=format&fit=crop&q=80&w=800" },
  { nome: "Bota Over the Knee Preta", descricao: "Bota cano longo acima do joelho em couro soft, salto grosso 8cm e zíper traseiro.", categoria: "Botas", preco: 2100.00, tamanhos: "35,36,37,38,39,40", cores: "Preto", imagem: "https://images.unsplash.com/photo-1608236445204-7132ff36ba2e?auto=format&fit=crop&q=80&w=800" },
  { nome: "Bota Coturno Luxo", descricao: "Coturno de luxo em couro vintage com cadarço frontal e fivela dourada.", categoria: "Botas", preco: 1590.00, tamanhos: "36,37,38,39,40", cores: "Preto,Marrom", imagem: "https://images.unsplash.com/photo-1491553895911-0055eca6402d?auto=format&fit=crop&q=80&w=800" },
  { nome: "Bota Cano Curto Fivela", descricao: "Bota ankle boot com detalhe de fivela lateral e bico fino.", categoria: "Botas", preco: 1390.00, tamanhos: "35,36,37,38,39", cores: "Preto,Nude", imagem: "https://images.unsplash.com/photo-1542831371-29b0f74f9713?auto=format&fit=crop&q=80&w=800" },
  { nome: "Bota Western Couro", descricao: "Bota estilo cowboy em couro legítimo com bordados artesanais e bico fino.", categoria: "Botas", preco: 1850.00, tamanhos: "35,36,37,38,39,40", cores: "Marrom,Caramelo", imagem: "https://images.unsplash.com/photo-1520975918453-257d299264d9?auto=format&fit=crop&q=80&w=800" },

  // ===== SCARPINS =====
  { nome: "Scarpin Bico Fino Preto", descricao: "Scarpin clássico bico fino em couro laqueado, salto 10cm e palmilha acolchoada.", categoria: "Scarpins", preco: 890.00, tamanhos: "34,35,36,37,38,39", cores: "Preto,Vermelho,Nude", imagem: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&q=80&w=800" },
  { nome: "Scarpin Salto Anabela", descricao: "Scarpin salto anabela revestido em palha natural com tiras finas.", categoria: "Scarpins", preco: 750.00, tamanhos: "35,36,37,38,39", cores: "Bege,Branco", imagem: "https://images.unsplash.com/photo-1560343090-f0409e92791a?auto=format&fit=crop&q=80&w=800" },
  { nome: "Scarpin Metalizado Prata", descricao: "Scarpin metalizado em lamê prateado, salto stiletto 11cm.", categoria: "Scarpins", preco: 1100.00, tamanhos: "35,36,37,38,39", cores: "Prata,Dourado", imagem: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=800" },
  { nome: "Scarpin Peep Toe Vermelho", descricao: "Scarpin peep toe em camurça vermelha com fivela dourada.", categoria: "Scarpins", preco: 950.00, tamanhos: "34,35,36,37,38,39", cores: "Vermelho,Preto", imagem: "https://images.unsplash.com/photo-1596704017254-9b121068fb31?auto=format&fit=crop&q=80&w=800" },
  { nome: "Scarpin Corta Costas", descricao: "Scarpin corta costas em couro nobuck com salto bloco 7cm.", categoria: "Scarpins", preco: 820.00, tamanhos: "35,36,37,38,39", cores: "Preto,Azul Marinho", imagem: "https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?auto=format&fit=crop&q=80&w=800" },

  // ===== SAPATILHAS =====
  { nome: "Sapatilha Ballet Rosa", descricao: "Sapatilha estilo ballet em cetim rosê com fita de amarrar no tornozelo.", categoria: "Sapatilhas", preco: 490.00, tamanhos: "34,35,36,37,38,39", cores: "Rosa,Preto,Nude", imagem: "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&q=80&w=800" },
  { nome: "Sapatilha Bico Quadrado", descricao: "Sapatilha bico quadrado em couro macio com solado antiderrapante.", categoria: "Sapatilhas", preco: 390.00, tamanhos: "34,35,36,37,38,39,40", cores: "Preto,Branco,Caramelo", imagem: "https://images.unsplash.com/photo-1614251055844-897aa82e1a61?auto=format&fit=crop&q=80&w=800" },
  { nome: "Sapatilha Mule Aberta", descricao: "Mule aberta em couro legítimo com tira larga e fivela minimalista.", categoria: "Sapatilhas", preco: 540.00, tamanhos: "35,36,37,38,39", cores: "Preto,Nude", imagem: "https://images.unsplash.com/photo-1614332569226-f46227a8e6fe?auto=format&fit=crop&q=80&w=800" },
  { nome: "Sapatilha Loafer Clássica", descricao: "Loafer clássica em couro preto com detalhe de corrente dourada.", categoria: "Sapatilhas", preco: 680.00, tamanhos: "35,36,37,38,39", cores: "Preto,Marrom", imagem: "https://images.unsplash.com/photo-1614251055844-897aa82e1a61?auto=format&fit=crop&q=80&w=800" },

  // ===== TÊNIS =====
  { nome: "Tênis Branco Couro Premium", descricao: "Tênis branco em couro premium com solado chunky e palmilha ortopédica.", categoria: "Tênis", preco: 690.00, tamanhos: "35,36,37,38,39,40", cores: "Branco,Preto", imagem: "https://images.unsplash.com/photo-1562183241-b937e95585b6?auto=format&fit=crop&q=80&w=800" },
  { nome: "Tênis Esportivo Rose Gold", descricao: "Tênis esportivo com detalhes rose gold e mesh respirável.", categoria: "Tênis", preco: 590.00, tamanhos: "35,36,37,38,39,40", cores: "Rosa,Branco,Cinza", imagem: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&q=80&w=800" },
  { nome: "Tênis Platform Chunky", descricao: "Tênis platform com solado tratorado 5cm e cabedal mix de materiais.", categoria: "Tênis", preco: 780.00, tamanhos: "35,36,37,38,39", cores: "Branco,Preto,Rosa", imagem: "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?auto=format&fit=crop&q=80&w=800" },
  { nome: "Tênis Slip On Casual", descricao: "Tênis slip on em lona premium com elástico lateral e solado vulcanizado.", categoria: "Tênis", preco: 450.00, tamanhos: "35,36,37,38,39,40", cores: "Preto,Branco,Marinho", imagem: "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&q=80&w=800" },

  // ===== SANDÁLIAS (adicional) =====
  { nome: "Sandália Salto Fino Glam", descricao: "Sandália de salto fino com tiras de strass e fivela no tornozelo.", categoria: "Sandálias", preco: 990.00, tamanhos: "34,35,36,37,38,39", cores: "Preto,Prata,Dourado", imagem: "https://images.unsplash.com/photo-1523381294911-8d3cead13475?auto=format&fit=crop&q=80&w=800" },
  { nome: "Sandália Plataforma Couro", descricao: "Sandália plataforma em couro com salto 14cm e tiras largas.", categoria: "Sandálias", preco: 850.00, tamanhos: "35,36,37,38,39", cores: "Preto,Nude", imagem: "https://images.unsplash.com/photo-1515548211230-973d8fa6c24d?auto=format&fit=crop&q=80&w=800" },
  { nome: "Sandália Rasteira Pérola", descricao: "Sandália rasteira com detalhes de pérolas artesanais e couro macio.", categoria: "Sandálias", preco: 520.00, tamanhos: "34,35,36,37,38,39", cores: "Branco,Preto,Rosa", imagem: "https://images.unsplash.com/photo-1552346157-742a8956167b?auto=format&fit=crop&q=80&w=800" },
  { nome: "Sandália Gladiadora Couro", descricao: "Sandália gladiadora em couro trançado com fechamento em tiras ajustáveis.", categoria: "Sandálias", preco: 650.00, tamanhos: "35,36,37,38,39", cores: "Caramelo,Preto,Marrom", imagem: "https://images.unsplash.com/photo-1593032465176-39b7cfb1663f?auto=format&fit=crop&q=80&w=800" },
  { nome: "Sandália Anabela Palha", descricao: "Sandália anabela em palha natural com salto 8cm e tiras de couro.", categoria: "Sandálias", preco: 580.00, tamanhos: "35,36,37,38,39", cores: "Bege,Branco,Preto", imagem: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&q=80&w=800" },
  { nome: "Sandália Slide Metalizada", descricao: "Sandália slide metalizada em couro com tira larga e solado confort.", categoria: "Sandálias", preco: 490.00, tamanhos: "34,35,36,37,38,39,40", cores: "Dourado,Prata", imagem: "https://images.unsplash.com/photo-1525097487452-6278ff080c31?auto=format&fit=crop&q=80&w=800" },

  // ===== BOLSAS =====
  { nome: "Bolsa Estruturada Top Handle", descricao: "Bolsa estruturada top handle em couro legítimo com ferragem dourada.", categoria: "Bolsas", preco: 3200.00, tamanhos: "Único", cores: "Preto,Branco, Vermelho", imagem: "https://images.unsplash.com/photo-1584916201218-f4242ceb4809?auto=format&fit=crop&q=80&w=800" },
  { nome: "Bolsa Transversal Acetinada", descricao: "Bolsa transversal em cetim com corrente dourada e fecho click.", categoria: "Bolsas", preco: 1800.00, tamanhos: "Único", cores: "Preto,Rosa,Prata", imagem: "https://images.unsplash.com/photo-1591561954557-26941169b49e?auto=format&fit=crop&q=80&w=800" },
  { nome: "Bolsa Tote Couro Legítimo", descricao: "Bolsa tote grande em couro legítimo com alças duplas e bolso interno.", categoria: "Bolsas", preco: 2500.00, tamanhos: "Único", cores: "Preto,Marrom,Caramelo", imagem: "https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?auto=format&fit=crop&q=80&w=800" },
  { nome: "Bolsa Mochila Couro Premium", descricao: "Mochila executiva em couro premium com compartimento para notebook.", categoria: "Bolsas", preco: 2100.00, tamanhos: "Único", cores: "Preto,Marrom", imagem: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&q=80&w=800" },
  { nome: "Bolsa Clutch Strass Noite", descricao: "Clutch de noite cravejada em strass com fecho magnético.", categoria: "Bolsas", preco: 1500.00, tamanhos: "Único", cores: "Prata,Dourado,Preto", imagem: "https://images.unsplash.com/photo-1563903530908-af12c9cc2f19?auto=format&fit=crop&q=80&w=800" },

  // ===== ACESSÓRIOS =====
  { nome: "Cinto Couro Largo Fivela", descricao: "Cinto largo em couro legítimo com fivela dourada dupla.", categoria: "Acessórios", preco: 450.00, tamanhos: "PP,P,M,G,GG", cores: "Preto,Marrom", imagem: "https://images.unsplash.com/photo-1624222247344-550fb60ae12f?auto=format&fit=crop&q=80&w=800" },
  { nome: "Lenço Seda Estampado", descricao: "Lenço quadrado em seda natural com estampa floral exclusiva.", categoria: "Acessórios", preco: 380.00, tamanhos: "Único", cores: "Azul,Rosa,Verde", imagem: "https://images.unsplash.com/photo-1602702654724-3518f53ce0e7?auto=format&fit=crop&q=80&w=800" },
  { nome: "Óculos Escuros Aviador", descricao: "Óculos estilo aviador com armação dourada e lentes degradê.", categoria: "Acessórios", preco: 890.00, tamanhos: "Único", cores: "Dourado,Preto,Prata", imagem: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&q=80&w=800" },
  { nome: "Pulseira Corrente Ouro", descricao: "Pulseira corrente em banho de ouro 18k com medalhão ATALAIA.", categoria: "Acessórios", preco: 590.00, tamanhos: "Único", cores: "Dourado", imagem: "https://images.unsplash.com/photo-1611930022073-b7a4ba5fcccd?auto=format&fit=crop&q=80&w=800" },
  { nome: "Bolsa Necessaire Couro", descricao: "Necessaire compacta em couro legítimo com zíper dourado.", categoria: "Acessórios", preco: 320.00, tamanhos: "Único", cores: "Preto,Rosa,Bege", imagem: "https://images.unsplash.com/photo-1598532163257-ae3c6b2524b6?auto=format&fit=crop&q=80&w=800" },
  { nome: "Cachecol Cashmere Premium", descricao: "Cachecol em cashmere 100% com acabamento franjado.", categoria: "Acessórios", preco: 780.00, tamanhos: "Único", cores: "Preto,Cinza,Marinho", imagem: "https://images.unsplash.com/photo-1601628828688-6b54d0f5f1d0?auto=format&fit=crop&q=80&w=800" },
];

async function main() {
    try {
        for (const item of products) {
            const insertRes = await pool.query(`
                INSERT INTO produtos (id, nome, descricao, categoria, preco, tamanhos, cores, imagem, estoque, ativo)
                VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, 25, true)
                RETURNING id, nome, categoria
            `, [item.nome, item.descricao, item.categoria, item.preco, item.tamanhos, item.cores, item.imagem]);
            console.log(`✓ [${item.categoria}] ${insertRes.rows[0].nome}`);
        }
        console.log(`\n✅ Seeding concluído! ${products.length} produtos inseridos.`);
    } catch (err) {
        console.error('Database Error:', err);
    } finally {
        pool.end();
    }
}

main();
