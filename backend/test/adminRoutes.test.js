jest.mock('express', () => ({ Router: jest.fn(() => ({ use: jest.fn(), get: jest.fn(), post: jest.fn(), put: jest.fn(), patch: jest.fn(), delete: jest.fn() })) }));
jest.mock('../src/middleware/adminAuth', () => jest.fn());
jest.mock('../src/config/database', () => ({ pool: { query: jest.fn() } }));
const { pool } = require('../src/config/database');
const router = require('../src/routes/admin');
const getHandlers = Object.fromEntries(router.get.mock.calls.map(([path, handler]) => [path, handler]));
const postHandlers = Object.fromEntries(router.post.mock.calls.map(([path, handler]) => [path, handler]));
const putHandlers = Object.fromEntries(router.put.mock.calls.map(([path, handler]) => [path, handler]));
const patchHandlers = Object.fromEntries(router.patch.mock.calls.map(([path, handler]) => [path, handler]));
const deleteHandlers = Object.fromEntries(router.delete.mock.calls.map(([path, handler]) => [path, handler]));
const get = p => getHandlers[p];
const post = p => postHandlers[p];
const put = p => putHandlers[p];
const patch = p => patchHandlers[p];
const del = p => deleteHandlers[p];
const res = () => ({ status: jest.fn().mockReturnThis(), json: jest.fn().mockReturnThis() });
const admin = { adminUser: { userId: 'admin-id' } };

describe('Rotas administrativas', () => {
 test.each([
  ['listar usuários', get('/users'), {}, 'Erro ao buscar usuários'],
  ['listar produtos', get('/products'), {}, 'Erro ao buscar produtos'],
  ['listar cupons', get('/coupons'), {}, 'Erro ao buscar cupons'],
  ['consultar estatísticas', get('/stats'), {}, 'Erro ao buscar estatísticas'],
  ['criar produto', post('/products'), {body:{nome:'Bota',preco:10}}, 'Erro ao criar produto'],
  ['alterar produto', put('/products/:id'), {body:{},params:{id:'alvo'}}, 'Erro ao atualizar produto'],
  ['alterar estrelas', patch('/products/:id/stars'), {body:{estrelas:2},params:{id:'alvo'}}, 'Erro ao atualizar estrelas'],
  ['remover produto', del('/products/:id'), {params:{id:'alvo'}}, 'Erro ao remover produto'],
  ['criar cupom', post('/coupons'), {body:{codigo:'TESTE',desconto:10}}, 'Erro ao criar cupom'],
  ['remover cupom', del('/coupons/:id'), {params:{id:'alvo'}}, 'Erro ao remover cupom'],
  ['alterar administrador', patch('/users/:id/toggle-admin'), {params:{id:'alvo'},...admin}, 'Erro ao atualizar usuário'],
  ['remover usuário', del('/users/:id'), {params:{id:'alvo'},...admin}, 'Erro ao remover usuário']
 ])('informa falha ao %s sem revelar detalhes do banco', async (nome, handler, req, mensagem) => {
  pool.query.mockRejectedValueOnce(new Error('detalhe privado do banco'));
  const resposta = res();
  await handler(req, resposta);
  expect(resposta.status).toHaveBeenCalledWith(500);
  expect(resposta.json).toHaveBeenCalledWith({error:mensagem});
 });

 describe.each([
  ['alteração de permissão', patch('/users/:id/toggle-admin')],
  ['desativação de usuário', del('/users/:id')]
 ])('%s', (nome, handler) => {
  test('rejeita usuário inexistente', async () => {
   pool.query.mockResolvedValueOnce({rows:[]});
   const resposta = res();
   await handler({params:{id:'alvo'},...admin}, resposta);
   expect(resposta.status).toHaveBeenCalledWith(404);
   expect(resposta.json).toHaveBeenCalledWith({error:'Usuário não encontrado'});
  });
  test('preserva o último administrador', async () => {
   pool.query.mockResolvedValueOnce({rows:[{id:'alvo',is_admin:true}]})
    .mockResolvedValueOnce({rows:[{count:'1'}]});
   const resposta = res();
   await handler({params:{id:'alvo'},...admin}, resposta);
   expect(resposta.status).toHaveBeenCalledWith(403);
   expect(resposta.json).toHaveBeenCalledWith({error:'Não é possível remover o último administrador.'});
   expect(pool.query).toHaveBeenCalledTimes(2);
  });
  test.each([true,false])('altera outro usuário com is_admin=%s', async (isAdmin) => {
   pool.query.mockResolvedValueOnce({rows:[{id:'alvo',is_admin:isAdmin}]});
   if (isAdmin) pool.query.mockResolvedValueOnce({rows:[{count:'2'}]});
   pool.query.mockResolvedValueOnce({rows:[{id:'alvo',is_admin:!isAdmin}]});
   const resposta = res();
   await handler({params:{id:'alvo'},...admin}, resposta);
   expect(pool.query).toHaveBeenLastCalledWith(expect.stringContaining('UPDATE usuarios'),['alvo']);
   if (nome === 'alteração de permissão') {
    expect(resposta.json).toHaveBeenCalledWith({id:'alvo',is_admin:!isAdmin});
   } else {
    expect(resposta.json).toHaveBeenCalledWith({message:'Usuário desativado com sucesso'});
   }
  });
 });
 test('informa usuário removido entre consulta e atualização', async () => {
  pool.query.mockResolvedValueOnce({rows:[{id:'alvo',is_admin:false}]})
   .mockResolvedValueOnce({rows:[]});
  const resposta = res();
  await del('/users/:id')({params:{id:'alvo'},...admin},resposta);
  expect(resposta.status).toHaveBeenCalledWith(404);
  expect(resposta.json).toHaveBeenCalledWith({error:'Usuário não encontrado'});
 });
 test('informa produto inexistente ao alterar estrelas', async () => {
  pool.query.mockResolvedValueOnce({rows:[]});
  const resposta = res();
  await patch('/products/:id/stars')({params:{id:'alvo'},body:{estrelas:3}},resposta);
  expect(resposta.status).toHaveBeenCalledWith(404);
  expect(resposta.json).toHaveBeenCalledWith({error:'Produto não encontrado'});
 });
 beforeEach(()=>{pool.query.mockReset();jest.spyOn(console,'error').mockImplementation(()=>{});}); afterEach(()=>jest.restoreAllMocks());
 test.each([['/users'],['/products'],['/coupons']])('lista dados administrativos em %s',async(path)=>{pool.query.mockResolvedValueOnce({rows:[{id:'x'}]});const r=res();await get(path)(admin,r);expect(r.json).toHaveBeenCalledWith([{id:'x'}]);});
 test('retorna estatísticas',async()=>{pool.query.mockResolvedValueOnce({rows:[{count:'1'}]}).mockResolvedValueOnce({rows:[{count:'2'}]}).mockResolvedValueOnce({rows:[{count:'3'}]});const r=res();await get('/stats')(admin,r);expect(r.json).toHaveBeenCalledWith({usuarios:1,produtos:2,cupons:3});});
 test('rejeita criação de produto sem dados obrigatórios',async()=>{const r=res();await post('/products')({body:{}},r);expect(r.status).toHaveBeenCalledWith(400);});
 test('cria produto administrativo',async()=>{pool.query.mockResolvedValueOnce({rows:[{id:'p'}]});const r=res();await post('/products')({body:{nome:'Bota',preco:'10'}},r);expect(r.status).toHaveBeenCalledWith(201);expect(r.json).toHaveBeenCalledWith({id:'p'});});
 test('atualiza ou informa produto inexistente',async()=>{pool.query.mockResolvedValueOnce({rows:[]});const r=res();await put('/products/:id')({params:{id:'x'},body:{}},r);expect(r.status).toHaveBeenCalledWith(404);});
 test('atualiza produto existente',async()=>{pool.query.mockResolvedValueOnce({rows:[{id:'x'}]});const r=res();await put('/products/:id')({params:{id:'x'},body:{preco:1}},r);expect(r.json).toHaveBeenCalledWith({id:'x'});});
 test.each([[undefined],[6],[-1]])('rejeita estrelas inválidas',async estrelas=>{const r=res();await patch('/products/:id/stars')({params:{id:'x'},body:{estrelas}},r);expect(r.status).toHaveBeenCalledWith(400);});
 test('atualiza estrelas existentes',async()=>{pool.query.mockResolvedValueOnce({rows:[{id:'x',estrelas:5}]});const r=res();await patch('/products/:id/stars')({params:{id:'x'},body:{estrelas:5}},r);expect(r.json).toHaveBeenCalledWith({id:'x',estrelas:5});});
 test('desativa produto ou informa inexistência',async()=>{pool.query.mockResolvedValueOnce({rows:[]});const r=res();await del('/products/:id')({params:{id:'x'}},r);expect(r.status).toHaveBeenCalledWith(404);});
 test('desativa produto existente',async()=>{pool.query.mockResolvedValueOnce({rows:[{nome:'Bota'}]});const r=res();await del('/products/:id')({params:{id:'x'}},r);expect(r.json).toHaveBeenCalledWith({message:'Produto "Bota" desativado'});});
 test('rejeita cupom sem dados obrigatórios',async()=>{const r=res();await post('/coupons')({body:{}},r);expect(r.status).toHaveBeenCalledWith(400);});
 test('cria cupom e trata código duplicado',async()=>{pool.query.mockResolvedValueOnce({rows:[{codigo:'TESTE'}]});const r=res();await post('/coupons')({body:{codigo:'teste',desconto:10}},r);expect(r.status).toHaveBeenCalledWith(201);pool.query.mockRejectedValueOnce(Object.assign(Error('dup'),{code:'23505'}));const duplicate=res();await post('/coupons')({body:{codigo:'teste',desconto:10}},duplicate);expect(duplicate.status).toHaveBeenCalledWith(400);});
 test('desativa cupom ou informa inexistência',async()=>{pool.query.mockResolvedValueOnce({rows:[]});const r=res();await del('/coupons/:id')({params:{id:'x'}},r);expect(r.status).toHaveBeenCalledWith(404);});
 test('desativa cupom existente',async()=>{pool.query.mockResolvedValueOnce({rows:[{codigo:'TESTE'}]});const r=res();await del('/coupons/:id')({params:{id:'x'}},r);expect(r.json).toHaveBeenCalledWith({message:'Cupom "TESTE" desativado'});});
 test('impede autoalteração administrativa',async()=>{const r=res();await patch('/users/:id/toggle-admin')({params:{id:'admin-id'},...admin},r);expect(r.status).toHaveBeenCalledWith(403);});
 test('impede autoexclusão administrativa',async()=>{const r=res();await del('/users/:id')({params:{id:'admin-id'},...admin},r);expect(r.status).toHaveBeenCalledWith(403);});
});
