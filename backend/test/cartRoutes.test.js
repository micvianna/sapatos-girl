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
    pool: {
        query: jest.fn()
    }
}));

jest.mock('uuid', () => ({
    v4: jest.fn(),
    validate: jest.fn()
}));

const { pool } = require('../src/config/database');
const { v4: uuidv4, validate: validateUuid } = require('uuid');

const router = require('../src/routes/cart');

const postHandlers = Object.fromEntries(
    router.post.mock.calls.map(([route, middleware, handler]) => [
        route,
        handler
    ])
);

const getHandlers = Object.fromEntries(
    router.get.mock.calls.map(([route, middleware, handler]) => [
        route,
        handler
    ])
);

function createResponse() {
    return {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis()
    };
}

function createRequest(body = {}) {
    return {
        body,
        userId: 'user-id'
    };
}

describe('Rota de carrinho — adicionar produto', () => {
    beforeEach(() => {
        pool.query.mockReset();
        uuidv4.mockReset();
        validateUuid.mockReset();

        validateUuid.mockReturnValue(true);
        uuidv4.mockReturnValue('simulated-item-id');

        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    test.each([
        ['produto ausente', { quantidade: 1 }],
        ['quantidade ausente', {
            produtoId: '11111111-1111-4111-8111-111111111111'
        }]
    ])('rejeita adição com %s', async (description, body) => {
        const res = createResponse();

        await postHandlers['/adicionar'](createRequest(body), res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            error: 'Produto e quantidade são obrigatórios'
        });

        expect(pool.query).not.toHaveBeenCalled();
    });

    test('rejeita produto com UUID inválido', async () => {
        validateUuid.mockReturnValue(false);

        const res = createResponse();

        await postHandlers['/adicionar'](createRequest({
            produtoId: 'produto-invalido',
            quantidade: 1
        }), res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            error: 'Produto inválido'
        });

        expect(pool.query).not.toHaveBeenCalled();
    });

    test.each([0, -1, 1.5, '2'])(
        'rejeita quantidade inválida: %p',
        async (quantidade) => {
            const res = createResponse();

            await postHandlers['/adicionar'](createRequest({
                produtoId: '11111111-1111-4111-8111-111111111111',
                quantidade
            }), res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                error: 'Quantidade inválida'
            });

            expect(pool.query).not.toHaveBeenCalled();
        }
    );

    test('rejeita produto inexistente ou inativo', async () => {
        pool.query.mockResolvedValueOnce({ rows: [] });

        const res = createResponse();

        await postHandlers['/adicionar'](createRequest({
            produtoId: '11111111-1111-4111-8111-111111111111',
            quantidade: 1
        }), res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            error: 'Produto inválido'
        });

        expect(pool.query).toHaveBeenCalledTimes(1);
    });

    test('cria carrinho e adiciona produto quando não existe carrinho ativo', async () => {
        uuidv4
            .mockReturnValueOnce('simulated-cart-id')
            .mockReturnValueOnce('simulated-item-id');

        pool.query
            .mockResolvedValueOnce({
                rows: [{ id: '11111111-1111-4111-8111-111111111111' }]
            })
            .mockResolvedValueOnce({ rows: [] })
            .mockResolvedValueOnce({ rows: [] })
            .mockResolvedValueOnce({ rows: [] });

        const res = createResponse();

        await postHandlers['/adicionar'](createRequest({
            produtoId: '11111111-1111-4111-8111-111111111111',
            quantidade: 2,
            tamanho: '38',
            cor: 'Preta'
        }), res);

        expect(pool.query).toHaveBeenNthCalledWith(
            3,
            expect.stringContaining('INSERT INTO carrinhos'),
            ['simulated-cart-id', 'user-id']
        );

        expect(pool.query).toHaveBeenNthCalledWith(
            4,
            expect.stringContaining('INSERT INTO itens_carrinho'),
            [
                'simulated-item-id',
                'simulated-cart-id',
                '11111111-1111-4111-8111-111111111111',
                2,
                '38',
                'Preta'
            ]
        );

        expect(res.json).toHaveBeenCalledWith({
            message: 'Produto adicionado ao carrinho'
        });
    });

    test('adiciona produto ao carrinho ativo existente', async () => {
        pool.query
            .mockResolvedValueOnce({
                rows: [{ id: '11111111-1111-4111-8111-111111111111' }]
            })
            .mockResolvedValueOnce({
                rows: [{ id: 'existing-cart-id' }]
            })
            .mockResolvedValueOnce({ rows: [] });

        const res = createResponse();

        await postHandlers['/adicionar'](createRequest({
            produtoId: '11111111-1111-4111-8111-111111111111',
            quantidade: 1
        }), res);

        expect(uuidv4).toHaveBeenCalledTimes(1);

        expect(pool.query).toHaveBeenNthCalledWith(
            3,
            expect.stringContaining('INSERT INTO itens_carrinho'),
            [
                'simulated-item-id',
                'existing-cart-id',
                '11111111-1111-4111-8111-111111111111',
                1,
                null,
                null
            ]
        );

        expect(res.json).toHaveBeenCalledWith({
            message: 'Produto adicionado ao carrinho'
        });
    });
});

describe('Rota de carrinho — visualizar', () => {
    beforeEach(() => {
        pool.query.mockReset();

        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    test('retorna carrinho vazio com total zero', async () => {
        pool.query.mockResolvedValueOnce({ rows: [] });

        const res = createResponse();

        await getHandlers['/'](
            { userId: 'user-id' },
            res
        );

        expect(pool.query).toHaveBeenCalledWith(
            expect.stringContaining('FROM itens_carrinho'),
            ['user-id']
        );

        expect(res.json).toHaveBeenCalledWith({
            itens: [],
            total: '0.00',
            quantidade: 0
        });
    });

    test('retorna itens, total e quantidade do carrinho', async () => {
        pool.query.mockResolvedValueOnce({
            rows: [
                {
                    id: 'item-1',
                    produto_id: 'product-1',
                    nome: 'Tênis',
                    preco: 199.90,
                    quantidade: 2,
                    tamanho: '38',
                    cor: 'Preta'
                },
                {
                    id: 'item-2',
                    produto_id: 'product-2',
                    nome: 'Sandália',
                    preco: 50,
                    quantidade: 1,
                    tamanho: '37',
                    cor: 'Bege'
                }
            ]
        });

        const res = createResponse();

        await getHandlers['/'](
            { userId: 'user-id' },
            res
        );

        expect(res.json).toHaveBeenCalledWith({
            itens: expect.any(Array),
            total: '449.80',
            quantidade: 3
        });
    });

    test('retorna 500 quando ocorre erro ao buscar carrinho', async () => {
        pool.query.mockRejectedValueOnce(
            new Error('Simulated database failure')
        );

        const res = createResponse();

        await getHandlers['/'](
            { userId: 'user-id' },
            res
        );

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
            error: 'Erro ao buscar carrinho'
        });
    });
});