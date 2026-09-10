jest.mock('express', () => ({ Router: jest.fn(() => ({ get: jest.fn(), post: jest.fn(), delete: jest.fn() })) }));
jest.mock('../src/middleware/auth', () => jest.fn());
jest.mock('../src/config/database', () => ({ pool: { query: jest.fn() } }));

const { pool } = require('../src/config/database');
const router = require('../src/routes/wishlist');
const handlers = {
    list: router.get.mock.calls.find(([path]) => path === '/')[2],
    check: router.get.mock.calls.find(([path]) => path.startsWith('/check'))[2],
    add: router.post.mock.calls[0][2],
    remove: router.delete.mock.calls[0][2]
};
const response = () => ({ status: jest.fn().mockReturnThis(), json: jest.fn().mockReturnThis() });

describe('Rotas de favoritos', () => {
    beforeEach(() => { pool.query.mockReset(); jest.spyOn(console, 'error').mockImplementation(() => {}); });
    afterEach(() => jest.restoreAllMocks());

    test('lista favoritos do usuário autenticado', async () => {
        pool.query.mockResolvedValueOnce({ rows: [{ id: 'product-id' }] });
        const res = response(); await handlers.list({ userId: 'user-id' }, res);
        expect(res.json).toHaveBeenCalledWith([{ id: 'product-id' }]);
    });
    test('retorna erro ao listar favoritos', async () => {
        pool.query.mockRejectedValueOnce(new Error('falha')); const res = response();
        await handlers.list({ userId: 'user-id' }, res);
        expect(res.status).toHaveBeenCalledWith(500);
    });
    test.each([[[], false], [[{ id: 'favorite-id' }], true]])('informa se o produto está favoritado', async (rows, favorited) => {
        pool.query.mockResolvedValueOnce({ rows }); const res = response();
        await handlers.check({ userId: 'user-id', params: { produto_id: 'product-id' } }, res);
        expect(res.json).toHaveBeenCalledWith({ favorited });
    });
    test('retorna erro ao verificar favorito', async () => {
        pool.query.mockRejectedValueOnce(new Error('falha')); const res = response();
        await handlers.check({ userId: 'user-id', params: { produto_id: 'product-id' } }, res);
        expect(res.status).toHaveBeenCalledWith(500);
    });
    test('exige identificador ao adicionar favorito', async () => {
        const res = response(); await handlers.add({ userId: 'user-id', params: {} }, res);
        expect(res.status).toHaveBeenCalledWith(400);
    });
    test('rejeita produto já favoritado', async () => {
        pool.query.mockResolvedValueOnce({ rows: [{ id: 'favorite-id' }] }); const res = response();
        await handlers.add({ userId: 'user-id', params: { produto_id: 'product-id' } }, res);
        expect(res.status).toHaveBeenCalledWith(400);
    });
    test('adiciona produto que ainda não é favorito', async () => {
        pool.query.mockResolvedValueOnce({ rows: [] }).mockResolvedValueOnce({ rows: [] }); const res = response();
        await handlers.add({ userId: 'user-id', params: { produto_id: 'product-id' } }, res);
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith({ message: 'Produto adicionado aos favoritos' });
    });
    test('retorna erro ao adicionar favorito', async () => {
        pool.query.mockRejectedValueOnce(new Error('falha')); const res = response();
        await handlers.add({ userId: 'user-id', params: { produto_id: 'product-id' } }, res);
        expect(res.status).toHaveBeenCalledWith(500);
    });
    test('remove favorito do usuário autenticado', async () => {
        pool.query.mockResolvedValueOnce({ rows: [] }); const res = response();
        await handlers.remove({ userId: 'user-id', params: { produto_id: 'product-id' } }, res);
        expect(res.json).toHaveBeenCalledWith({ message: 'Produto removido dos favoritos' });
    });
    test('retorna erro ao remover favorito', async () => {
        pool.query.mockRejectedValueOnce(new Error('falha')); const res = response();
        await handlers.remove({ userId: 'user-id', params: { produto_id: 'product-id' } }, res);
        expect(res.status).toHaveBeenCalledWith(500);
    });
});
