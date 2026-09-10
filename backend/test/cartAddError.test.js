jest.mock('express', () => ({
    Router: jest.fn(() => ({
        post: jest.fn(),
        get: jest.fn(),
        delete: jest.fn(),
        put: jest.fn()
    }))
}));

jest.mock('../src/middleware/auth', () => jest.fn());

jest.mock('../src/config/database', () => ({
    pool: { query: jest.fn() }
}));

jest.mock('uuid', () => ({
    v4: jest.fn(),
    validate: jest.fn()
}));

const { pool } = require('../src/config/database');
const { validate: validateUuid } = require('uuid');
const router = require('../src/routes/cart');

const addToCart = router.post.mock.calls.find(
    ([route]) => route === '/adicionar'
)[2];

function createResponse() {
    return {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis()
    };
}

describe('Rota de carrinho — falha ao adicionar produto', () => {
    beforeEach(() => {
        pool.query.mockReset();
        validateUuid.mockReset();
        validateUuid.mockReturnValue(true);
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    test('retorna erro interno quando a consulta de produto falha', async () => {
        pool.query.mockRejectedValueOnce(new Error('Falha simulada no banco'));
        const res = createResponse();

        await addToCart(
            {
                body: {
                    produtoId: '11111111-1111-4111-8111-111111111111',
                    quantidade: 1
                },
                userId: 'user-id'
            },
            res
        );

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
            error: 'Erro ao adicionar ao carrinho'
        });
    });
});
