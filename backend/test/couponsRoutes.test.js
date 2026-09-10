jest.mock('express', () => ({ Router: jest.fn(() => ({ post: jest.fn() })) }));
jest.mock('../src/config/database', () => ({ pool: { query: jest.fn() } }));

const { pool } = require('../src/config/database');
const router = require('../src/routes/coupons');
const validateCoupon = router.post.mock.calls[0][1];
const response = () => ({ status: jest.fn().mockReturnThis(), json: jest.fn().mockReturnThis() });

describe('Rota de validação de cupom', () => {
    beforeEach(() => { pool.query.mockReset(); jest.spyOn(console, 'error').mockImplementation(() => {}); });
    afterEach(() => jest.restoreAllMocks());

    test('exige o código do cupom', async () => {
        const res = response();
        await validateCoupon({ body: {} }, res);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ error: 'Código do cupom é obrigatório' });
    });

    test('rejeita cupom inexistente', async () => {
        pool.query.mockResolvedValueOnce({ rows: [] });
        const res = response();
        await validateCoupon({ body: { codigo: 'invalido' } }, res);
        expect(pool.query).toHaveBeenCalledWith(expect.any(String), ['INVALIDO']);
        expect(res.status).toHaveBeenCalledWith(404);
    });

    test.each([
        ['expirado', { expiracao: '2000-01-01', uso_atual: 0, uso_max: 1 }, 'Cupom expirado'],
        ['esgotado', { expiracao: null, uso_atual: 1, uso_max: 1 }, 'Cupom atingiu o limite de usos']
    ])('rejeita cupom %s', async (description, coupon, error) => {
        pool.query.mockResolvedValueOnce({ rows: [coupon] });
        const res = response();
        await validateCoupon({ body: { codigo: 'teste' } }, res);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ error });
    });

    test('retorna desconto de cupom ativo', async () => {
        pool.query.mockResolvedValueOnce({ rows: [{ expiracao: null, uso_atual: 0, uso_max: 2, desconto: 10, tipo: 'percent' }] });
        const res = response();
        await validateCoupon({ body: { codigo: 'teste10' } }, res);
        expect(res.json).toHaveBeenCalledWith({ message: 'Cupom aplicado com sucesso!', desconto: 10, tipo: 'percent' });
    });

    test('retorna erro interno quando a consulta falha', async () => {
        pool.query.mockRejectedValueOnce(new Error('Falha simulada'));
        const res = response();
        await validateCoupon({ body: { codigo: 'teste10' } }, res);
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ error: 'Erro ao validar cupom' });
    });
});
