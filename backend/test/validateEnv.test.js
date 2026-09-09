const validateEnv = require('../src/config/validateEnv');

const validEnvironment = {
    JWT_SECRET: 'simulated-test-secret',
    DB_HOST: 'localhost',
    DB_PORT: '5432',
    DB_NAME: 'test_database',
    DB_USER: 'test_user',
    DB_PASSWORD: 'simulated-test-password',
    NODE_ENV: 'test'
};

const requiredKeys = Object.keys(validEnvironment);

describe('validateEnv', () => {
    let previousEnvironment;
    let exitSpy;
    let errorSpy;
    let logSpy;
    let exitSignal;

    beforeEach(() => {
        previousEnvironment = {};

        for (const key of requiredKeys) {
            previousEnvironment[key] = process.env[key];
            process.env[key] = validEnvironment[key];
        }

        exitSignal = new Error('Simulated process exit');

        exitSpy = jest
            .spyOn(process, 'exit')
            .mockImplementation(() => {
                throw exitSignal;
            });

        errorSpy = jest
            .spyOn(console, 'error')
            .mockImplementation(() => {});

        logSpy = jest
            .spyOn(console, 'log')
            .mockImplementation(() => {});
    });

    afterEach(() => {
        for (const key of requiredKeys) {
            if (previousEnvironment[key] === undefined) {
                delete process.env[key];
            } else {
                process.env[key] = previousEnvironment[key];
            }
        }

        jest.restoreAllMocks();
    });

    test('aceita todas as variáveis preenchidas', () => {
        expect(() => validateEnv()).not.toThrow();

        expect(exitSpy).not.toHaveBeenCalled();
        expect(errorSpy).not.toHaveBeenCalled();

        expect(logSpy).toHaveBeenCalledWith(
            '✅ Todas as variáveis de ambiente obrigatórias validadas'
        );
    });

    test.each(requiredKeys)(
        'encerra com código 1 quando %s está ausente',
        (key) => {
            delete process.env[key];

            expect(() => validateEnv()).toThrow(exitSignal);

            expect(exitSpy).toHaveBeenCalledWith(1);
            expect(exitSpy).toHaveBeenCalledTimes(1);

            expect(errorSpy).toHaveBeenCalledWith(
                `   - ${key}`
            );

            expect(logSpy).not.toHaveBeenCalled();
        }
    );

    test.each(requiredKeys)(
        'encerra com código 1 quando %s está vazia',
        (key) => {
            process.env[key] = '';

            expect(() => validateEnv()).toThrow(exitSignal);

            expect(exitSpy).toHaveBeenCalledWith(1);

            expect(errorSpy).toHaveBeenCalledWith(
                `   - ${key}`
            );

            expect(logSpy).not.toHaveBeenCalled();
        }
    );

    test('informa todas as variáveis ausentes juntas', () => {
        for (const key of requiredKeys) {
            delete process.env[key];
        }

        expect(() => validateEnv()).toThrow(exitSignal);

        for (const key of requiredKeys) {
            expect(errorSpy).toHaveBeenCalledWith(
                `   - ${key}`
            );
        }

        expect(exitSpy).toHaveBeenCalledTimes(1);
        expect(exitSpy).toHaveBeenCalledWith(1);
        expect(logSpy).not.toHaveBeenCalled();
    });
});