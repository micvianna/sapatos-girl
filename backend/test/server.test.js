const http = require('http');
const { once } = require('events');

jest.mock('dotenv', () => ({config: jest.fn()}));
jest.mock('../src/config/database', () => ({
    pool: {query: jest.fn()},
    validateDatabaseConnection: jest.fn()
}));

function request(server, path, origin) {
    return new Promise((resolve, reject) => {
        const headers = origin ? {Origin: origin} : {};
        http.get({host:'127.0.0.1', port:server.address().port, path, headers}, response => {
            let body = '';
            response.on('data', chunk => { body += chunk; });
            response.on('end', () => resolve({status:response.statusCode, headers:response.headers, body}));
        }).on('error', reject);
    });
}

describe('Servidor HTTP e inicialização', () => {
    let entryCoverage;

    afterAll(() => {
        if (global.__coverage__ && entryCoverage) {
            const {createCoverageMap} = require('istanbul-lib-coverage');
            const merged = createCoverageMap(global.__coverage__);
            merged.merge(entryCoverage);
            global.__coverage__ = JSON.parse(JSON.stringify(merged));
        }
    });
    test('define saída de erro quando executado como entrada sem credenciais', async () => {
        // Executa o mesmo módulo como entrada CommonJS, com um processo isolado.
        // A instrumentação usa o mesmo arquivo e mapa do relatório Jest.
        const fs = require('fs');
        const vm = require('vm');
        const path = require('path');
        const {createRequire} = require('module');
        const {createInstrumenter} = require('istanbul-lib-instrument');
        const filename = path.resolve(__dirname, '../src/server.js');
        const source = fs.readFileSync(filename, 'utf8');
        const instrumenter = createInstrumenter();
        const code = instrumenter.instrumentSync(source, filename);
        const entry = {exports:{}};
        const localRequire = createRequire(filename);
        const entryRequire = name => {
            if (name === 'dotenv') return {config() {}};
            if (name === './config/database') return {validateDatabaseConnection: jest.fn()};
            return localRequire(name);
        };
        entryRequire.main = entry;
        const isolatedProcess = {env:{}, exitCode:0};
        const context = vm.createContext({
            require:entryRequire, module:entry, exports:entry.exports,
            process:isolatedProcess, console, __coverage__:{}
        });
        vm.runInContext(code, context, {filename});
        await new Promise(resolve => setImmediate(resolve));
        expect(isolatedProcess.exitCode).toBe(1);
        expect(typeof entry.exports.startServer).toBe('function');
        entryCoverage = context.__coverage__;
    });
    let savedEnvironment;
    let server;

    beforeEach(() => {
        savedEnvironment = {...process.env};
        process.env.DB_PASSWORD = 'senha-apenas-de-teste';
        process.env.JWT_SECRET = 'segredo-apenas-de-teste';
        process.env.PORT = '0';
        delete process.env.CORS_ORIGIN;
        jest.resetModules();
        jest.spyOn(console, 'log').mockImplementation(() => {});
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(async () => {
        if (server) await new Promise(resolve => server.close(resolve));
        server = undefined;
        process.env = savedEnvironment;
        jest.restoreAllMocks();
    });

    test('inicia após validar banco e responde ao health check', async () => {
        const {startServer} = require('../src/server');
        const database = require('../src/config/database');
        server = await startServer();
        const response = await request(server, '/api/health');
        expect(database.validateDatabaseConnection).toHaveBeenCalledTimes(1);
        expect(response.status).toBe(200);
        expect(JSON.parse(response.body)).toEqual({message:'Server is running', status:'ok'});
    });

    test('publica a especificação e informa rota inexistente', async () => {
        server = await require('../src/server').startServer();
        const spec = await request(server, '/api/openapi.json');
        expect(spec.status).toBe(200);
        expect(JSON.parse(spec.body)).toEqual(require('../src/config/openapi.json'));
        const missing = await request(server, '/rota-inexistente');
        expect(missing.status).toBe(404);
        expect(JSON.parse(missing.body)).toEqual({error:'Rota não encontrada'});
    });

    test('permite origem padrão e bloqueia origem desconhecida', async () => {
        server = await require('../src/server').startServer();
        const allowed = await request(server, '/api/health', 'http://localhost:3000');
        expect(allowed.status).toBe(200);
        expect(allowed.headers['access-control-allow-origin']).toBe('http://localhost:3000');
        const blocked = await request(server, '/api/health', 'http://origem-invalida.test');
        expect(blocked.status).toBe(500);
        expect(JSON.parse(blocked.body)).toEqual({error:'Erro interno do servidor'});
        expect(blocked.headers['access-control-allow-origin']).toBeUndefined();
    });

    test('aceita origens configuradas com espaços', async () => {
        process.env.CORS_ORIGIN = ' http://localhost:4000 , http://localhost:4001 ';
        server = await require('../src/server').startServer();
        const response = await request(server, '/api/health', 'http://localhost:4001');
        expect(response.status).toBe(200);
        expect(response.headers['access-control-allow-origin']).toBe('http://localhost:4001');
    });

    test('não inicia sem as credenciais obrigatórias', async () => {
        delete process.env.DB_PASSWORD;
        delete process.env.JWT_SECRET;
        const {startServer} = require('../src/server');
        await expect(startServer()).rejects.toThrow('DB_PASSWORD, JWT_SECRET');
        expect(require('../src/config/database').validateDatabaseConnection).not.toHaveBeenCalled();
    });

    test('propaga indisponibilidade do banco', async () => {
        const {startServer} = require('../src/server');
        require('../src/config/database').validateDatabaseConnection.mockRejectedValueOnce(new Error('Banco indisponível'));
        await expect(startServer()).rejects.toThrow('Banco indisponível');
    });

    test('informa conflito de porta sem encerrar o servidor existente', async () => {
        server = http.createServer();
        server.listen(0);
        await once(server, 'listening');
        process.env.PORT = String(server.address().port);
        const {startServer} = require('../src/server');
        await expect(startServer()).rejects.toMatchObject({code:'EADDRINUSE'});
        expect(server.listening).toBe(true);
    });

    test('usa porta 5000 quando não configurada', async () => {
        delete process.env.PORT;
        const {app, startServer} = require('../src/server');
        const {EventEmitter} = require('events');
        const listener = new EventEmitter();
        jest.spyOn(app, 'listen').mockImplementation((port, callback) => {
            process.nextTick(callback);
            return listener;
        });
        await expect(startServer()).resolves.toBe(listener);
        expect(app.listen).toHaveBeenCalledWith(5000, expect.any(Function));
    });
});
