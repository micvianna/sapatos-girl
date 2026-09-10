jest.mock('express', () => ({
    Router: jest.fn(() => ({
        post: jest.fn()
    }))
}));

jest.mock('../src/config/database', () => ({
    pool: {
        query: jest.fn()
    }
}));

jest.mock('bcryptjs', () => ({
    genSalt: jest.fn(),
    hash: jest.fn(),
    compare: jest.fn()
}));

jest.mock('jsonwebtoken', () => ({
    sign: jest.fn()
}));

jest.mock('uuid', () => ({
    v4: jest.fn()
}));

jest.mock('crypto', () => ({
    randomBytes: jest.fn(),
    createHash: jest.fn()
}));

const { pool } = require('../src/config/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const crypto = require('crypto');

const router = require('../src/routes/auth');

// Captura os handlers antes de o Jest limpar os mocks.
const handlers = Object.fromEntries(
    router.post.mock.calls.map(([route, handler]) => [
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

describe('Rotas de cadastro e login', () => {
    beforeEach(() => {
        pool.query.mockReset();
        bcrypt.genSalt.mockReset();
        bcrypt.hash.mockReset();
        bcrypt.compare.mockReset();
        jwt.sign.mockReset();
        crypto.randomBytes.mockReset();
        crypto.createHash.mockReset();
        uuidv4.mockReset();

        bcrypt.genSalt.mockResolvedValue('simulated-salt');
        bcrypt.hash.mockResolvedValue('simulated-hash');
        jwt.sign.mockReturnValue('simulated-token');
        uuidv4.mockReturnValue('simulated-user-id');

        crypto.randomBytes.mockReturnValue({
            toString: jest.fn().mockReturnValue('simulated-reset-token')
        });

        crypto.createHash.mockReturnValue({
            update: jest.fn().mockReturnThis(),
            digest: jest.fn().mockReturnValue('simulated-token-hash')
        });

        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    test.each([
        ['nome ausente', { email: 'ana@example.com', senha: '123456' }],
        ['email ausente', { nome: 'Ana', senha: '123456' }],
        ['senha ausente', { nome: 'Ana', email: 'ana@example.com' }]
    ])('cadastro rejeita %s', async (description, body) => {
        const res = createResponse();

        await handlers['/register']({ body }, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            error: 'Nome, email e senha são obrigatórios'
        });

        expect(pool.query).not.toHaveBeenCalled();
        expect(jwt.sign).not.toHaveBeenCalled();
    });

    test('cadastro rejeita email inválido', async () => {
        const res = createResponse();

        await handlers['/register']({
            body: {
                nome: 'Ana',
                email: 'email-invalido',
                senha: '123456'
            }
        }, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            error: 'Email inválido'
        });
        expect(pool.query).not.toHaveBeenCalled();
    });

    test('cadastro rejeita usuário existente', async () => {
        pool.query.mockResolvedValueOnce({
            rows: [{ id: 'existing-user' }]
        });

        const res = createResponse();

        await handlers['/register']({
            body: {
                nome: 'Ana',
                email: 'ana@example.com',
                senha: '123456'
            }
        }, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            error: 'Usuário já existe'
        });

        expect(pool.query).toHaveBeenCalledTimes(1);
        expect(bcrypt.hash).not.toHaveBeenCalled();
        expect(jwt.sign).not.toHaveBeenCalled();
    });

    test('cadastro normaliza os dados e armazena o hash', async () => {
        pool.query
            .mockResolvedValueOnce({ rows: [] })
            .mockResolvedValueOnce({ rows: [] });

        const res = createResponse();

        await handlers['/register']({
            body: {
                nome: '  Ana  ',
                email: '  ANA@EXAMPLE.COM  ',
                senha: '123456'
            }
        }, res);

        expect(pool.query).toHaveBeenNthCalledWith(
            1,
            expect.any(String),
            ['ana@example.com']
        );

        expect(bcrypt.hash).toHaveBeenCalledWith(
            '123456',
            'simulated-salt'
        );

        expect(pool.query).toHaveBeenNthCalledWith(
            2,
            expect.stringContaining('INSERT INTO usuarios'),
            [
                'simulated-user-id',
                'Ana',
                'ana@example.com',
                'simulated-hash',
                null
            ]
        );

        expect(jwt.sign).toHaveBeenCalledWith(
            {
                userId: 'simulated-user-id',
                email: 'ana@example.com',
                is_admin: false
            },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRE || '7d' }
        );

        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith({
            message: 'Usuário criado com sucesso',
            token: 'simulated-token',
            user: {
                id: 'simulated-user-id',
                nome: 'Ana',
                email: 'ana@example.com',
                is_admin: false
            }
        });
    });

    test('cadastro retorna 500 quando o banco falha', async () => {
        pool.query.mockRejectedValueOnce(
            new Error('Simulated database failure')
        );

        const res = createResponse();

        await handlers['/register']({
            body: {
                nome: 'Ana',
                email: 'ana@example.com',
                senha: '123456'
            }
        }, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
            error: 'Erro ao registrar usuário'
        });
        expect(jwt.sign).not.toHaveBeenCalled();
    });

    test.each([
        ['email ausente', { senha: '123456' }],
        ['senha ausente', { email: 'ana@example.com' }]
    ])('login rejeita %s', async (description, body) => {
        const res = createResponse();

        await handlers['/login']({ body }, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            error: 'Email e senha são obrigatórios'
        });
        expect(pool.query).not.toHaveBeenCalled();
    });

    test('login rejeita usuário inexistente', async () => {
        pool.query.mockResolvedValueOnce({ rows: [] });

        const res = createResponse();

        await handlers['/login']({
            body: {
                email: 'ana@example.com',
                senha: '123456'
            }
        }, res);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({
            error: 'Credenciais inválidas'
        });

        expect(bcrypt.compare).not.toHaveBeenCalled();
        expect(jwt.sign).not.toHaveBeenCalled();
    });

    test('login rejeita senha incorreta', async () => {
        pool.query.mockResolvedValueOnce({
            rows: [{
                id: 'user-id',
                senha: 'stored-hash'
            }]
        });

        bcrypt.compare.mockResolvedValueOnce(false);

        const res = createResponse();

        await handlers['/login']({
            body: {
                email: 'ana@example.com',
                senha: 'wrong-password'
            }
        }, res);

        expect(bcrypt.compare).toHaveBeenCalledWith(
            'wrong-password',
            'stored-hash'
        );

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({
            error: 'Credenciais inválidas'
        });
        expect(jwt.sign).not.toHaveBeenCalled();
    });

    test.each([false, true])(
        'login válido preserva is_admin=%s',
        async (isAdmin) => {
            pool.query.mockResolvedValueOnce({
                rows: [{
                    id: 'user-id',
                    nome: 'Ana',
                    email: 'ana@example.com',
                    senha: 'stored-hash',
                    is_admin: isAdmin
                }]
            });

            bcrypt.compare.mockResolvedValueOnce(true);

            const res = createResponse();

            await handlers['/login']({
                body: {
                    email: '  ANA@EXAMPLE.COM  ',
                    senha: '123456'
                }
            }, res);

            expect(pool.query).toHaveBeenCalledWith(
                expect.any(String),
                ['ana@example.com']
            );

            expect(jwt.sign).toHaveBeenCalledWith(
                {
                    userId: 'user-id',
                    email: 'ana@example.com',
                    is_admin: isAdmin
                },
                process.env.JWT_SECRET,
                { expiresIn: process.env.JWT_EXPIRE || '7d' }
            );

            expect(res.json).toHaveBeenCalledWith({
                message: 'Login realizado com sucesso',
                token: 'simulated-token',
                user: {
                    id: 'user-id',
                    nome: 'Ana',
                    email: 'ana@example.com',
                    is_admin: isAdmin
                }
            });

            expect(res.status).not.toHaveBeenCalled();
        }
    );

    test('login retorna 500 quando o banco falha', async () => {
        pool.query.mockRejectedValueOnce(
            new Error('Simulated database failure')
        );

        const res = createResponse();

        await handlers['/login']({
            body: {
                email: 'ana@example.com',
                senha: '123456'
            }
        }, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
            error: 'Erro ao fazer login'
        });
        expect(jwt.sign).not.toHaveBeenCalled();
    });
describe('Reset de senha', () => {
    test('solicitação de reset rejeita email ausente', async () => {
        const res = createResponse();

        await handlers['/reset/request'](
            { body: {} },
            res
        );

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            error: 'Email é obrigatório'
        });

        expect(pool.query).not.toHaveBeenCalled();
    });

    test('solicitação de reset não revela email inexistente', async () => {
        pool.query.mockResolvedValueOnce({ rows: [] });

        const res = createResponse();

        await handlers['/reset/request'](
            {
                body: {
                    email: 'missing@example.com'
                }
            },
            res
        );

        expect(res.json).toHaveBeenCalledWith({
            message: 'Se o email estiver cadastrado, você receberá instruções para redefinir sua senha.'
        });

        expect(crypto.randomBytes).not.toHaveBeenCalled();
        expect(pool.query).toHaveBeenCalledTimes(1);
    });

    test('solicitação de reset cria token para usuário existente', async () => {
        pool.query
            .mockResolvedValueOnce({
                rows: [{ id: 'user-id' }]
            })
            .mockResolvedValueOnce({ rows: [] })
            .mockResolvedValueOnce({ rows: [] });

        const res = createResponse();

        await handlers['/reset/request'](
            {
                body: {
                    email: 'ana@example.com'
                }
            },
            res
        );

        expect(crypto.randomBytes).toHaveBeenCalledWith(32);
        expect(crypto.createHash).toHaveBeenCalledWith(
            'sha256'
        );

        expect(pool.query).toHaveBeenNthCalledWith(
            2,
            expect.stringContaining(
                'UPDATE password_reset_tokens'
            ),
            ['user-id']
        );

        expect(pool.query).toHaveBeenNthCalledWith(
            3,
            expect.stringContaining(
                'INSERT INTO password_reset_tokens'
            ),
            [
                'simulated-user-id',
                'user-id',
                'simulated-token-hash'
            ]
        );

        expect(res.json).toHaveBeenCalledWith({
            message: 'Se o email estiver cadastrado, você receberá instruções para redefinir sua senha.'
        });
    });

    test('solicitação de reset retorna token apenas em desenvolvimento', async () => {
        const previousNodeEnv = process.env.NODE_ENV;
        process.env.NODE_ENV = 'development';

        pool.query
            .mockResolvedValueOnce({
                rows: [{ id: 'user-id' }]
            })
            .mockResolvedValueOnce({ rows: [] })
            .mockResolvedValueOnce({ rows: [] });

        const res = createResponse();

        try {
            await handlers['/reset/request'](
                {
                    body: {
                        email: 'ana@example.com'
                    }
                },
                res
            );

            expect(res.json).toHaveBeenCalledWith({
                message: 'Token de reset gerado (modo desenvolvimento).',
                resetToken: 'simulated-reset-token'
            });
        } finally {
            if (previousNodeEnv === undefined) {
                delete process.env.NODE_ENV;
            } else {
                process.env.NODE_ENV = previousNodeEnv;
            }
        }
    });

    test('solicitação de reset retorna 500 quando o banco falha', async () => {
        pool.query.mockRejectedValueOnce(
            new Error('Simulated database failure')
        );

        const res = createResponse();

        await handlers['/reset/request'](
            {
                body: {
                    email: 'ana@example.com'
                }
            },
            res
        );

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
            error: 'Erro ao processar solicitação de reset'
        });
    });

    test.each([
        ['token ausente', { novaSenha: '123456' }],
        ['nova senha ausente', { token: 'reset-token' }]
    ])('confirmação de reset rejeita %s', async (description, body) => {
        const res = createResponse();

        await handlers['/reset/confirm']({ body }, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            error: 'Token e nova senha são obrigatórios'
        });

        expect(pool.query).not.toHaveBeenCalled();
    });

    test('confirmação de reset rejeita senha menor que seis caracteres', async () => {
        const res = createResponse();

        await handlers['/reset/confirm'](
            {
                body: {
                    token: 'reset-token',
                    novaSenha: '12345'
                }
            },
            res
        );

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            error: 'A senha deve ter pelo menos 6 caracteres'
        });

        expect(pool.query).not.toHaveBeenCalled();
    });

    test('confirmação de reset rejeita token inválido ou expirado', async () => {
        pool.query.mockResolvedValueOnce({ rows: [] });

        const res = createResponse();

        await handlers['/reset/confirm'](
            {
                body: {
                    token: 'reset-token',
                    novaSenha: 'new-password'
                }
            },
            res
        );

        expect(crypto.createHash).toHaveBeenCalledWith(
            'sha256'
        );

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            error: 'Token inválido ou expirado'
        });

        expect(bcrypt.hash).not.toHaveBeenCalled();
    });

    test('confirmação de reset atualiza senha e inutiliza o token', async () => {
        pool.query
            .mockResolvedValueOnce({
                rows: [{
                    id: 'reset-id',
                    usuario_id: 'user-id'
                }]
            })
            .mockResolvedValueOnce({ rows: [] })
            .mockResolvedValueOnce({ rows: [] });

        const res = createResponse();

        await handlers['/reset/confirm'](
            {
                body: {
                    token: 'reset-token',
                    novaSenha: 'new-password'
                }
            },
            res
        );

        expect(bcrypt.genSalt).toHaveBeenCalledWith(10);
        expect(bcrypt.hash).toHaveBeenCalledWith(
            'new-password',
            'simulated-salt'
        );

        expect(pool.query).toHaveBeenNthCalledWith(
            2,
            'UPDATE usuarios SET senha = $1 WHERE id = $2',
            ['simulated-hash', 'user-id']
        );

        expect(pool.query).toHaveBeenNthCalledWith(
            3,
            'UPDATE password_reset_tokens SET used = true WHERE id = $1',
            ['reset-id']
        );

        expect(res.json).toHaveBeenCalledWith({
            message: 'Senha redefinida com sucesso'
        });
    });

    test('confirmação de reset retorna 500 quando o banco falha', async () => {
        pool.query.mockRejectedValueOnce(
            new Error('Simulated database failure')
        );

        const res = createResponse();

        await handlers['/reset/confirm'](
            {
                body: {
                    token: 'reset-token',
                    novaSenha: 'new-password'
                }
            },
            res
        );

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
            error: 'Erro ao redefinir a senha'
        });
    });
});
});