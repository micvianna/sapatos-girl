const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');

const analyzerPath = path.join(__dirname, 'analyze-zap.js');

const tempDirectory = fs.mkdtempSync(
    path.join(os.tmpdir(), 'zap-analyzer-tests-')
);

const expectedHost = 'sapatos-frontend-test';
const expectedPort = '3000';

function createReport(risks, host = expectedHost) {
    return {
        site: [
            {
                '@host': host,
                '@port': expectedPort,
                alerts: risks.map(risk => ({
                    riskcode: String(risk)
                }))
            }
        ]
    };
}

const scenarios = [
    {
        name: 'No alerts',
        report: createReport([]),
        expected: 0
    },
    {
        name: 'Info and Low are allowed',
        report: createReport([0, 1]),
        expected: 0
    },
    {
        name: 'Medium produces WARNING',
        report: createReport([2]),
        expected: 3
    },
    {
        name: 'High produces FAILED',
        report: createReport([3]),
        expected: 2
    },
    {
        name: 'High takes priority over Medium',
        report: createReport([2, 3]),
        expected: 2
    },
    {
        name: 'Invalid JSON',
        rawJson: '{ invalid json',
        expected: 1
    },
    {
        name: 'Missing JSON file',
        missingJson: true,
        expected: 1
    },
    {
        name: 'Unexpected target',
        report: createReport([], 'unexpected-host'),
        expected: 1
    },
    {
        name: 'Empty HTML report',
        report: createReport([]),
        html: '',
        expected: 1
    },
    {
        name: 'Missing HTML file',
        report: createReport([]),
        missingHtml: true,
        expected: 1
    },
    {
        name: 'Unknown severity',
        report: createReport([4]),
        expected: 1
    },
    {
        name: 'Missing scanned sites',
        report: { site: [] },
        expected: 1
    },
    {
        name: 'Invalid alerts field',
        report: {
            site: [
                {
                    '@host': expectedHost,
                    '@port': expectedPort,
                    alerts: null
                }
            ]
        },
        expected: 1
    }
];

let failures = 0;

try {
    for (const [index, scenario] of scenarios.entries()) {
        const directory = path.join(
            tempDirectory,
            String(index)
        );

        fs.mkdirSync(directory);

        const jsonPath = path.join(directory, 'report.json');
        const htmlPath = path.join(directory, 'report.html');

        if (!scenario.missingJson) {
            const content = scenario.rawJson ??
                JSON.stringify(scenario.report);

            fs.writeFileSync(jsonPath, content);
        }

        if (!scenario.missingHtml) {
            fs.writeFileSync(
                htmlPath,
                scenario.html ?? '<html>Test report</html>'
            );
        }

        const result = spawnSync(
            process.execPath,
            [
                analyzerPath,
                jsonPath,
                htmlPath,
                expectedHost,
                expectedPort
            ],
            {
                encoding: 'utf8',
                timeout: 10000
            }
        );

        try {
            if (result.error) {
                throw result.error;
            }

            assert.equal(
                result.signal,
                null,
                'Analyzer terminated by signal'
            );

            assert.equal(
                result.status,
                scenario.expected,
                `Expected exit ${scenario.expected}, ` +
                `received ${result.status}`
            );

            if (scenario.expected === 1) {
                assert.match(
                    result.stderr,
                    /ZAP report error:/
                );
            } else {
                const expectedLabel = {
                    0: 'PASSED',
                    2: 'FAILED',
                    3: 'WARNING'
                }[scenario.expected];

                assert.ok(
                    result.stdout.includes(
                        `ZAP SECURITY: ${expectedLabel}`
                    ),
                    'Expected security status missing from output'
                );
            }

            console.log(`PASS: ${scenario.name}`);
        } catch (error) {
            failures++;

            console.error(`FAIL: ${scenario.name}`);
            console.error(error.message);
            console.error(result.stdout || '');
            console.error(result.stderr || '');
        }
    }
} finally {
    fs.rmSync(tempDirectory, {
        recursive: true,
        force: true
    });
}

const passed = scenarios.length - failures;

console.log('');
console.log(
    `ZAP ANALYZER TESTS: ${passed}/${scenarios.length} PASSED`
);

process.exitCode = failures === 0 ? 0 : 1;