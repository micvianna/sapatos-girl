jest.mock('express', () => ({ Router: jest.fn(() => ({ get: jest.fn(), post: jest.fn() })) }));
jest.mock('../src/config/database', () => ({ pool: { query: jest.fn() } }));
jest.mock('../src/middleware/adminAuth', () => jest.fn());
jest.mock('../src/utils/categoryHelper', () => ({ normalizeCategory: jest.fn(value => value) }));
jest.mock('uuid', () => ({ validate: jest.fn() }));

const { pool } = require('../src/config/database');
const { validate } = require('uuid');
const router = require('../src/routes/products');
const highlights = router.get.mock.calls.find(([path]) => path === '/highlights')[1];
const list = router.get.mock.calls.find(([path]) => path === '/')[1];
const detail = router.get.mock.calls.find(([path]) => path === '/:id')[1];
const create = router.post.mock.calls[0][2];
const response = () => ({ status: jest.fn().mockReturnThis(), json: jest.fn().mockReturnThis() });

describe('Rotas de produtos', () => {
 test.each([{rows:[]}, {rows:[{total:0}]}])('retorna metadados de catálogo vazio', async ({rows}) => {
  pool.query.mockResolvedValueOnce({rows:[]}).mockResolvedValueOnce({rows});
  const resposta = response();
  await list({query:{include_meta:'true'}}, resposta);
  expect(resposta.json).toHaveBeenCalledWith({itens:[],meta:{page:1,limit:20,total:0,totalPages:1,sort:'nome',order:'asc'}});
 });
 test('preserva produto explicitamente inativo na criação', async () => {
  pool.query.mockResolvedValueOnce({rows:[{id:'produto',ativo:false}]});
  const resposta = response();
  await create({body:{nome:'Bota',preco:20,ativo:false}},resposta);
  expect(pool.query).toHaveBeenCalledWith(expect.any(String),expect.arrayContaining([false]));
  expect(resposta.json).toHaveBeenCalledWith({id:'produto',ativo:false});
 });
 beforeEach(() => { pool.query.mockReset(); validate.mockReset(); validate.mockReturnValue(true); jest.spyOn(console, 'error').mockImplementation(() => {}); });
 afterEach(() => jest.restoreAllMocks());
 test('lista destaques com limite normalizado', async () => { pool.query.mockResolvedValueOnce({ rows: [{ id: 'p1' }] }); const res=response(); await highlights({query:{limit:'99'}},res); expect(pool.query).toHaveBeenCalledWith(expect.any(String),[24]); expect(res.json).toHaveBeenCalledWith({itens:[{id:'p1'}],quantidade:1}); });
 test('retorna erro ao buscar destaques', async () => { pool.query.mockRejectedValueOnce(Error('falha')); const res=response(); await highlights({query:{}},res); expect(res.status).toHaveBeenCalledWith(500); });
 test('lista produtos simples', async () => { pool.query.mockResolvedValueOnce({rows:[]}); const res=response(); await list({query:{}},res); expect(res.json).toHaveBeenCalledWith([]); });
 test('lista produtos com filtros, metadados e paginação', async () => { pool.query.mockResolvedValueOnce({rows:[{id:'p1'}]}).mockResolvedValueOnce({rows:[{total:3}]}); const res=response(); await list({query:{categoria:'Botas',preco_min:'10',preco_max:'20',busca:'bota',page:'2',limit:'2',sort:'preco',order:'desc',include_meta:'true'}},res); expect(res.json).toHaveBeenCalledWith(expect.objectContaining({itens:[{id:'p1'}],meta:expect.objectContaining({page:2,limit:2,total:3,totalPages:2,sort:'preco',order:'desc'})})); });
 test('retorna erro ao listar produtos', async () => { pool.query.mockRejectedValueOnce(Error('falha')); const res=response(); await list({query:{}},res); expect(res.status).toHaveBeenCalledWith(500); });
 test('rejeita identificador inválido', async () => { validate.mockReturnValue(false); const res=response(); await detail({params:{id:'x'}},res); expect(res.status).toHaveBeenCalledWith(400); });
 test('retorna 404 para produto ausente', async()=>{pool.query.mockResolvedValueOnce({rows:[]});const res=response();await detail({params:{id:'11111111-1111-4111-8111-111111111111'}},res);expect(res.status).toHaveBeenCalledWith(404);});
 test('retorna detalhe de produto existente', async()=>{pool.query.mockResolvedValueOnce({rows:[{id:'p1'}]});const res=response();await detail({params:{id:'11111111-1111-4111-8111-111111111111'}},res);expect(res.json).toHaveBeenCalledWith({id:'p1'});});
 test('retorna erro ao buscar detalhe', async()=>{pool.query.mockRejectedValueOnce(Error('falha'));const res=response();await detail({params:{id:'11111111-1111-4111-8111-111111111111'}},res);expect(res.status).toHaveBeenCalledWith(500);});
 test.each([[{},'nome e preco são obrigatórios'],[{nome:'A',preco:'x'},'preco deve ser um número maior que zero'],[{nome:'A',preco:1,estoque:-1},'estoque deve ser um número maior ou igual a zero']])('rejeita criação inválida',async(body,error)=>{const res=response();await create({body},res);expect(res.status).toHaveBeenCalledWith(400);expect(res.json).toHaveBeenCalledWith({error});});
 test('cria produto válido',async()=>{pool.query.mockResolvedValueOnce({rows:[{id:'p1'}]});const res=response();await create({body:{nome:'Bota',preco:'10',estoque:'2',imagens:['a']}},res);expect(res.status).toHaveBeenCalledWith(201);expect(res.json).toHaveBeenCalledWith({id:'p1'});});
 test('retorna erro ao criar produto',async()=>{pool.query.mockRejectedValueOnce(Error('falha'));const res=response();await create({body:{nome:'Bota',preco:10}},res);expect(res.status).toHaveBeenCalledWith(500);});
});
