const mockPool = { on: jest.fn(), connect: jest.fn() };
jest.mock('pg', () => ({ Pool: jest.fn(() => mockPool) }));

describe('Configuração de banco', () => {
    beforeEach(() => {
        jest.resetModules();
        mockPool.on.mockReset();
        mockPool.connect.mockReset();
        jest.spyOn(console, 'log').mockImplementation(() => {});
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });
    afterEach(() => jest.restoreAllMocks());

    test('valida conexão e libera o cliente', async () => {
        const release = jest.fn();
        mockPool.connect.mockResolvedValueOnce({ release });
        const { validateDatabaseConnection } = require('../src/config/database');
        await validateDatabaseConnection();
        expect(release).toHaveBeenCalledTimes(1);
    });

    test('propaga falha de conexão com diagnóstico', async () => {
        const error = new Error('conexão recusada');
        mockPool.connect.mockRejectedValueOnce(error);
        const { validateDatabaseConnection } = require('../src/config/database');
        await expect(validateDatabaseConnection()).rejects.toThrow('conexão recusada');
        expect(console.error).toHaveBeenCalled();
    });

    test('registra erro inesperado emitido pelo pool', () => {
        const { pool } = require('../src/config/database');
        const listener = mockPool.on.mock.calls.find(([event]) => event === 'error')[1];
        listener(new Error('queda do pool'));
        expect(pool).toBe(mockPool);
        expect(console.error).toHaveBeenCalled();
    });
});
