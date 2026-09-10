jest.mock('express', () => ({
    Router: jest.fn(() => ({ post: jest.fn(), get: jest.fn() }))
}));
jest.mock('../src/middleware/auth', () => jest.fn());
jest.mock('../src/config/database', () => ({ pool: { query: jest.fn() } }));
jest.mock('uuid', () => ({ v4: jest.fn() }));
jest.mock('../src/utils/businessRules', () => ({
    isGrandeSP: jest.fn(),
    calcPixDiscount: jest.fn(),
    calcDeliveryEstimate: jest.fn()
}));

const { pool } = require('../src/config/database');
const { v4: uuidv4 } = require('uuid');
const { calcPixDiscount, calcDeliveryEstimate } = require('../src/utils/businessRules');
const router = require('../src/routes/orders');
const createOrder = router.post.mock.calls[0][2];
const listOrders = router.get.mock.calls[0][2];

const validOrder = {
    endereco: 'Rua das Flores, 100', cidade: 'São Paulo', estado: 'SP',
    cep: '01000-000', metodo_pagamento: 'pix'
};

function createResponse() {
    return { status: jest.fn().mockReturnThis(), json: jest.fn().mockReturnThis() };
}

function createRequest(body = validOrder) {
    return { body, userId: 'user-id' };
}

function mockCartWithItems(previousOrders = '0') {
    pool.query
        .mockResolvedValueOnce({ rows: [{ id: 'cart-id' }] })
        .mockResolvedValueOnce({ rows: [{ produto_id: 'product-id', quantidade: 2, preco: 50, tamanho: '38', cor: 'Preta' }] })
        .mockResolvedValueOnce({ rows: [{ count: previousOrders }] })
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({ rows: [] });
}

describe('Rotas de pedidos', () => {
    beforeEach(() => {
        pool.query.mockReset();
        uuidv4.mockReset();
        calcPixDiscount.mockReset();
        calcDeliveryEstimate.mockReset();
        uuidv4.mockReturnValue('generated-id');
        calcPixDiscount.mockReturnValue(5);
        calcDeliveryEstimate.mockReturnValue({ prazoEntrega: 'Same-Day (até 21h00)' });
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => jest.restoreAllMocks());

    test.each(['endereco', 'cidade', 'estado', 'cep', 'metodo_pagamento'])(
        'rejeita pedido sem %s', async (field) => {
            const body = { ...validOrder };
            delete body[field];
            const res = createResponse();

            await createOrder(createRequest(body), res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ error: 'Preencha todos os campos obrigatórios' });
            expect(pool.query).not.toHaveBeenCalled();
        }
    );

    test('rejeita método de pagamento fora do contrato', async () => {
        const res = createResponse();
        await createOrder(createRequest({ ...validOrder, metodo_pagamento: 'dinheiro' }), res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ error: 'Método de pagamento inválido' });
    });

    test.each([
        ['sem carrinho', [{ rows: [] }]],
        ['com carrinho sem itens', [{ rows: [{ id: 'cart-id' }] }, { rows: [] }]]
    ])('rejeita carrinho vazio %s', async (description, queries) => {
        pool.query.mockResolvedValueOnce(queries[0]);
        if (queries[1]) pool.query.mockResolvedValueOnce(queries[1]);
        const res = createResponse();

        await createOrder(createRequest(), res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ error: 'Carrinho vazio' });
    });

    test('cria pedido Pix, aplica desconto e desativa o carrinho', async () => {
        mockCartWithItems();
        const res = createResponse();

        await createOrder(createRequest(), res);

        expect(calcPixDiscount).toHaveBeenCalledWith(100, 'pix');
        expect(calcDeliveryEstimate).toHaveBeenCalledWith('São Paulo', 'SP');
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            total: '95.00', descontoPix: '5.00', status: 'pendente', emAnalise: false
        }));
        expect(pool.query).toHaveBeenLastCalledWith(
            'UPDATE carrinhos SET ativo = false WHERE id = $1', ['cart-id']
        );
    });

    test.each([
        ['primeira compra no cartão', '0', 'em_analise', true],
        ['compra posterior no cartão', '1', 'pendente', false],
        ['pedido por boleto', '0', 'pendente', false]
    ])('define status para %s', async (description, previousOrders, status, emAnalise) => {
        mockCartWithItems(previousOrders);
        const res = createResponse();
        const metodo = description.includes('cartão') ? 'cartao_credito' : 'boleto';

        await createOrder(createRequest({ ...validOrder, metodo_pagamento: metodo }), res);

        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ status, emAnalise }));
    });

    test('retorna erro interno quando uma operação do pedido falha', async () => {
        pool.query.mockRejectedValueOnce(new Error('Falha simulada no banco'));
        const res = createResponse();

        await createOrder(createRequest(), res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ error: 'Erro ao criar pedido' });
    });

    test('lista somente os pedidos encontrados para o usuário autenticado', async () => {
        pool.query.mockResolvedValueOnce({ rows: [{ id: 'order-id' }] });
        const res = createResponse();

        await listOrders({ userId: 'user-id' }, res);

        expect(pool.query).toHaveBeenCalledWith(expect.stringContaining('WHERE usuario_id = $1'), ['user-id']);
        expect(res.json).toHaveBeenCalledWith([{ id: 'order-id' }]);
    });

    test('retorna erro interno quando a listagem falha', async () => {
        pool.query.mockRejectedValueOnce(new Error('Falha simulada no banco'));
        const res = createResponse();

        await listOrders({ userId: 'user-id' }, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ error: 'Erro ao buscar pedidos' });
    });
});
