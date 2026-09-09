const fs = require('node:fs');

const [
    jsonPath,
    htmlPath,
    expectedHost,
    expectedPort
] = process.argv.slice(2);

try {
    if (
        !jsonPath ||
        !htmlPath ||
        !expectedHost ||
        !expectedPort
    ) {
        throw new Error(
            'Usage: node scripts/analyze-zap.js ' +
            '<jsonPath> <htmlPath> <host> <port>'
        );
    }

    const html = fs.readFileSync(htmlPath, 'utf8');

    if (!html.trim()) {
        throw new Error('Empty HTML report');
    }

    const report = JSON.parse(
        fs.readFileSync(jsonPath, 'utf8')
    );

    if (
        !report ||
        !Array.isArray(report.site) ||
        report.site.length === 0
    ) {
        throw new Error('Missing scanned sites');
    }

    const targetFound = report.site.some(site =>
        site &&
        site['@host'] === expectedHost &&
        String(site['@port']) === expectedPort
    );

    if (!targetFound) {
        throw new Error('Expected target absent from report');
    }

    const counts = {
        info: 0,
        low: 0,
        medium: 0,
        high: 0
    };

    const severityNames = [
        'info',
        'low',
        'medium',
        'high'
    ];

    for (const site of report.site) {
        if (!site || !Array.isArray(site.alerts)) {
            throw new Error('Invalid alerts field');
        }

        for (const alert of site.alerts) {
            const risk = String(alert?.riskcode);

            if (!/^[0-3]$/.test(risk)) {
                throw new Error('Unknown risk code: ' + risk);
            }

            const severity = severityNames[Number(risk)];
            counts[severity]++;
        }
    }

    console.log('');
    console.log('======= ZAP SECURITY SUMMARY =======');
    console.log(`Target : ${expectedHost}:${expectedPort}`);
    console.log(`Info   : ${counts.info}`);
    console.log(`Low    : ${counts.low}`);
    console.log(`Medium : ${counts.medium}`);
    console.log(`High   : ${counts.high}`);

    if (counts.high > 0) {
        console.log('ZAP SECURITY: FAILED');
        process.exitCode = 2;
    } else if (counts.medium > 0) {
        console.log('ZAP SECURITY: WARNING');
        process.exitCode = 3;
    } else {
        console.log('ZAP SECURITY: PASSED');
        process.exitCode = 0;
    }
} catch (error) {
    console.error('ZAP report error: ' + error.message);
    process.exitCode = 1;
}