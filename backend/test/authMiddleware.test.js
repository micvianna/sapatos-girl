jest.mock('jsonwebtoken', () => ({
    verify: jest.fn()
}));

const jwt = require('jsonwebtoken');
const auth = require('../src/middleware/auth');
const adminAuth = require('../src/middleware/adminAuth');

function createResponse() {
    return {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis()
    };
}

describe.each([
    ['auth', auth],
    ['adminAuth', adminAuth]
])('%s: rejeição de autenticação', (name, middleware) => {
    beforeEach(() => {
        jwt.verify.mockReset();
    });

    test.each([
        ['cabeçalho ausente', undefined],
        ['cabeçalho vazio', ''],
        ['token ausente', 'Bearer']
    ])('retorna 401 quando há %s', (description, header) => {
        const req = {
            headers: header === undefined
                ? {}
                : { authorization: header }
        };

        const res = createResponse();
        const next = jest.fn();

        middleware(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);

        expect(res.json).toHaveBeenCalledWith({
            error: 'Token não fornecido'
        });

        expect(jwt.verify).not.toHaveBeenCalled();
        expect(next).not.toHaveBeenCalled();
    });

    test.each([
        ['TokenExpiredError', 'Token expirado'],
        ['JsonWebTokenError', 'Token malformado'],
        ['Error', 'Token inválido']
    ])('trata %s', (errorName, expectedMessage) => {
        jwt.verify.mockImplementation(() => {
            const error = new Error('Simulated verification error');
            error.name = errorName;
            throw error;
        });

        const req = {
            headers: {
                authorization: 'Bearer simulated-token'
            }
        };

        const res = createResponse();
        const next = jest.fn();

        middleware(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);

        expect(res.json).toHaveBeenCalledWith({
            error: expectedMessage
        });

        expect(next).not.toHaveBeenCalled();
        expect(req.userId).toBeUndefined();
        expect(req.adminUser).toBeUndefined();
    });
});

describe('auth: acesso permitido', () => {
    beforeEach(() => {
        jwt.verify.mockReset();
    });

    test('preenche userId e continua a requisição', () => {
        jwt.verify.mockReturnValue({
            userId: 42
        });

        const req = {
            headers: {
                authorization: 'Bearer simulated-token'
            }
        };

        const res = createResponse();
        const next = jest.fn();

        auth(req, res, next);

        expect(jwt.verify).toHaveBeenCalledWith(
            'simulated-token',
            process.env.JWT_SECRET
        );

        expect(req.userId).toBe(42);
        expect(next).toHaveBeenCalledTimes(1);
        expect(next).toHaveBeenCalledWith();
        expect(res.status).not.toHaveBeenCalled();
        expect(res.json).not.toHaveBeenCalled();
    });
});

describe('adminAuth: autorização', () => {
    beforeEach(() => {
        jwt.verify.mockReset();
    });

    test.each([
        ['usuário comum', { userId: 42, is_admin: false }],
        ['permissão ausente', { userId: 42 }]
    ])('retorna 403 para %s', (description, decoded) => {
        jwt.verify.mockReturnValue(decoded);

        const req = {
            headers: {
                authorization: 'Bearer simulated-token'
            }
        };

        const res = createResponse();
        const next = jest.fn();

        adminAuth(req, res, next);

        expect(res.status).toHaveBeenCalledWith(403);

        expect(res.json).toHaveBeenCalledWith({
            error: 'Acesso negado. Apenas administradores.'
        });

        expect(next).not.toHaveBeenCalled();
        expect(req.adminUser).toBeUndefined();
    });

    test('permite administrador e preenche adminUser', () => {
        const decoded = {
            userId: 7,
            is_admin: true
        };

        jwt.verify.mockReturnValue(decoded);

        const req = {
            headers: {
                authorization: 'Bearer simulated-token'
            }
        };

        const res = createResponse();
        const next = jest.fn();

        adminAuth(req, res, next);

        expect(jwt.verify).toHaveBeenCalledWith(
            'simulated-token',
            process.env.JWT_SECRET
        );

        expect(req.adminUser).toEqual(decoded);
        expect(next).toHaveBeenCalledTimes(1);
        expect(next).toHaveBeenCalledWith();
        expect(res.status).not.toHaveBeenCalled();
        expect(res.json).not.toHaveBeenCalled();
    });
});