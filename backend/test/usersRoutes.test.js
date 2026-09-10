jest.mock('express', () => ({ Router: jest.fn(() => ({ get: jest.fn(), put: jest.fn() })) }));
jest.mock('../src/middleware/auth', () => jest.fn());
jest.mock('../src/config/database', () => ({ pool: { query: jest.fn() } }));

const { pool } = require('../src/config/database');
const router = require('../src/routes/users');
const getProfile = router.get.mock.calls[0][2];
const updateProfile = router.put.mock.calls[0][2];
const response = () => ({ status: jest.fn().mockReturnThis(), json: jest.fn().mockReturnThis() });

describe('Rotas de perfil', () => {
    beforeEach(() => { pool.query.mockReset(); jest.spyOn(console, 'error').mockImplementation(() => {}); });
    afterEach(() => jest.restoreAllMocks());

    test('retorna o perfil do usuário autenticado', async () => {
        pool.query.mockResolvedValueOnce({ rows: [{ id: 'user-id', email: 'ana@example.com' }] });
        const res = response();
        await getProfile({ userId: 'user-id' }, res);
        expect(pool.query).toHaveBeenCalledWith(expect.stringContaining('WHERE id = $1'), ['user-id']);
        expect(res.json).toHaveBeenCalledWith({ id: 'user-id', email: 'ana@example.com' });
    });

    test('retorna 404 quando o usuário não existe', async () => {
        pool.query.mockResolvedValueOnce({ rows: [] });
        const res = response();
        await getProfile({ userId: 'missing-id' }, res);
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ error: 'Usuário não encontrado' });
    });

    test('retorna erro interno quando a busca de perfil falha', async () => {
        pool.query.mockRejectedValueOnce(new Error('Falha simulada'));
        const res = response();
        await getProfile({ userId: 'user-id' }, res);
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ error: 'Erro ao buscar perfil' });
    });

    test('atualiza somente os dados enviados pelo usuário autenticado', async () => {
        pool.query.mockResolvedValueOnce({ rows: [] });
        const res = response();
        await updateProfile({ userId: 'user-id', body: { nome: 'Ana', telefone: '11999999999' } }, res);
        expect(pool.query).toHaveBeenCalledWith(expect.stringContaining('UPDATE usuarios'), ['Ana', '11999999999', 'user-id']);
        expect(res.json).toHaveBeenCalledWith({ message: 'Perfil atualizado com sucesso' });
    });

    test('retorna erro interno quando a atualização falha', async () => {
        pool.query.mockRejectedValueOnce(new Error('Falha simulada'));
        const res = response();
        await updateProfile({ userId: 'user-id', body: {} }, res);
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ error: 'Erro ao atualizar perfil' });
    });
});
