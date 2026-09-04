
def apiTestsStatus = 'NOT_RUN'
def integrationTestsStatus = 'NOT_RUN'
def e2eTestsStatus = 'NOT_RUN'
def performanceTestsStatus = 'NOT_RUN'
def dependencyScanStatus = 'NOT_RUN'
def dependencySecurityStatus = 'NOT_RUN'
def trivyFilesystemScanStatus = 'NOT_RUN'
def trivyFilesystemSecurityStatus = 'NOT_RUN'
def trivyImageScanStatus = 'NOT_RUN'
def trivyImageSecurityStatus = 'NOT_RUN'


pipeline {
    agent any

    options {
        skipDefaultCheckout(true)
    }

    environment {
        DB_PASSWORD = credentials('sapatos-db-password')
        JWT_SECRET = credentials('sapatos-jwt-secret')  
    }
        stages { 
            stage('Begin') {
                steps {
                    script {
                        apiTestsStatus = 'NOT_RUN'
                        integrationTestsStatus = 'NOT_RUN'
                        e2eTestsStatus = 'NOT_RUN'
                        performanceTestsStatus = 'NOT_RUN'
                        dependencyScanStatus = 'NOT_RUN'
                        dependencySecurityStatus = 'NOT_RUN'
                        trivyFilesystemScanStatus = 'NOT_RUN'
                        trivyFilesystemSecurityStatus = 'NOT_RUN'
                        trivyImageScanStatus = 'NOT_RUN'
                        trivyImageSecurityStatus = 'NOT_RUN'
                    }
                    echo 'Jenkis funcionando corretamente!'
                }
            }
            stage('Jenkins Environment') {
                steps {
                    echo "JOB_NAME: ${env.JOB_NAME}"
                    echo "BUILD_NUMBER: ${env.BUILD_NUMBER}"
                    echo "BUILD_URL: ${env.BUILD_URL}"
                    echo "WORKSPACE: ${env.WORKSPACE}"
                }
            }
            // get Operation System
            stage('VPS System') {
                steps {
                    sh 'uname -a'
                }
            }
            // get git version
            stage('Git') {
                steps {
                    sh 'git --version'
                }
            }
            // access github and perform checkout  
            stage('Checkout') {
                steps {
                    git branch: 'main',
                        url: 'https://github.com/micvianna/sapatos-girl.git'
                }
            }
            stage('Cleanup Previous Environment') {
                steps {
                      sh '''
                        echo "Removing containers from previous build..."
                        
                        docker rm -f sapatos-frontend-test 2>/dev/null || true
                        docker rm -f sapatos-backend-test 2>/dev/null || true
                        docker rm -f sapatos-postgres-test 2>/dev/null || true
                        
                        echo "Removing old test reports..."
                        rm -f "$WORKSPACE"/reports/*.xml

                        echo "Removing olt html reports..."
                        rm -f "$WORKSPACE"/reports/*.html

                        echo "Preparing Docker network..."

                        docker network inspect sapatos-test-net >/dev/null 2>/dev/null || \
                        docker network create sapatos-test-net
                    '''
                  }
            }
            stage('backend: Install dependencies') {
                steps {
                    dir('backend') {
                        sh '''
                        
                        docker run --rm \
                          --user 1000:1000 \
                          -v jenkins_home:/var/jenkins_home \
                          -w "$PWD" \
                          node:22-alpine \
                          npm ci
                        '''
                    }
                }
            }
            stage('frontend: Install dependencies') {
                steps {
                    dir('frontend') {
                        sh '''
                        rm -rf node_modules
                        
                        docker run --rm \
                          --user 1000:1000 \
                          -v jenkins_home:/var/jenkins_home \
                          -w "$PWD" \
                          node:22-alpine \
                          npm ci
                        '''
                    }
                }
            }
            // instal test database
            stage('Start PostgreSQL') {
                steps {
                    sh '''
                        docker rm -f sapatos-postgres-test 2>/dev/null || true
                        
                        docker run -d \
                          --name sapatos-postgres-test \
                          --network sapatos-test-net \
                          -e POSTGRES_DB=sapatos_ecommerce \
                          -e POSTGRES_USER=postgres \
                          -e POSTGRES_PASSWORD="$DB_PASSWORD" \
                          postgres:16-alpine
                    '''
                }
            }
            stage('Verify PostgreSQL') {
                steps {
                    sh '''

                        echo "Wainting for PostgresSQL..."

                        for i in $(seq 1 30); do
                            if docker exec sapatos-postgres-test \
                                pg_isready -U postgres -d sapatos_ecommerce; then

                                echo "PostgreSQL is ready"
                                exit 0
                            fi

                            echo "Attempt $i/30"
                            sleep 2
                        done

                        echo "PostgreSQL did not become ready"
                        docker logs sapatos-postgres-test
                        exit 1

                    '''
                }
            }
            stage('Apply Database Schema') {
                steps {
                    sh '''
                        docker exec -i sapatos-postgres-test \
                        psql -U postgres -d sapatos_ecommerce \
                        < database/schema.sql
                    '''
                }
            }
            stage('Verify Database Schema') {
                steps {
                    sh '''
                        docker exec sapatos-postgres-test \
                          psql -U postgres -d sapatos_ecommerce -c "\\dt"
                    '''    
                }
            }
            stage('Start Backend') {
                steps {
                    sh '''
                        docker rm -f sapatos-backend-test 2>/dev/null || true
                        
                        docker run -d \
                          --name sapatos-backend-test \
                          --user 1000:1000 \
                          --network sapatos-test-net \
                          -e PORT=5000 \
                          -e DB_HOST=sapatos-postgres-test \
                          -e DB_PORT=5432 \
                          -e DB_NAME=sapatos_ecommerce \
                          -e DB_USER=postgres \
                          -e DB_PASSWORD="$DB_PASSWORD" \
                          -e JWT_SECRET="$JWT_SECRET" \
                          -e JWT_EXPIRE=7d \
                          -e CORS_ORIGIN=http://localhost:3000,http://sapatos-frontend-test:3000 \
                          -v jenkins_home:/var/jenkins_home \
                          -w "$WORKSPACE/backend" \
                          node:22-alpine \
                          npm start
                    '''
                }
            }
            stage('Verify Backend') {
                steps {
                    sh '''
                        echo "Wainting for backend..."

                        for i in $(seq 1 30); do
                            if docker exec sapatos-backend-test \
                                wget -qO- http://localhost:5000/api/health > /dev/null 2>&1; then
                                
                                echo "Backend is ready"
                                exit 0
                            fi
                            
                            echo "Attempt $i/30 - backend not ready yet"
                            sleep 2
                        done
                        
                        echo "Backend did not start in time"
                        docker logs sapatos-backend-test
                        exit 1
                    '''
                }
            }
            stage('Start Frontend') {
                steps {
                    sh '''
                        docker rm -f sapatos-frontend-test 2>/dev/null || true
                        
                        docker run -d \
                          --name sapatos-frontend-test \
                          --user 1000:1000 \
                          --network sapatos-test-net \
                          -e REACT_APP_API_URL=http://sapatos-backend-test:5000 \
                          -v jenkins_home:/var/jenkins_home \
                          -w "$WORKSPACE/frontend" \
                          node:22-alpine \
                          npm start
                    '''
                }
            }
            stage('Verify Frontend') {
                steps {
                    sh '''
                        echo "Wainting for frontend..."
                        
                        for i in $(seq 1 30); do
                            if docker exec sapatos-frontend-test \
                                wget -qO- http://127.0.0.1:3000 > /dev/null 2>&1; then
                                
                                echo "Frontend is ready"
                                exit 0
                            fi
                            
                            echo "Attempt $i/30 - frontend not ready yet"
                            sleep 2
                        done
                        
                        echo "Frontend did not start in time"
                        docker logs sapatos-frontend-test
                        exit 1
                    '''
                }
            }
            stage('Pytest API Test') {
                steps {
                    script {
                        def status = sh(
                            script: '''
                                echo "PYTEST API TESTS"
            
                                mkdir -p "$WORKSPACE/reports"
            
                                docker run --rm \
                                  --user 1000:1000 \
                                  --network sapatos-test-net \
                                  -e API_BASE_URL=http://sapatos-backend-test:5000 \
                                  -e FRONTEND_ORIGIN=http://sapatos-frontend-test:3000 \
                                  -e JWT_SECRET="$JWT_SECRET" \
                                  -v jenkins_home:/var/jenkins_home \
                                  -w "$WORKSPACE" \
                                  python:3.12-slim \
                                  sh -c '
                                    python -m venv /tmp/pytest-venv &&
                                    /tmp/pytest-venv/bin/pip install --no-cache-dir -r tests/requirements.txt &&
                                    /tmp/pytest-venv/bin/python -m pytest \
                                      -c tests/pytest.ini \
                                      tests/api \
                                      -v \
                                      --junitxml=reports/api-tests.xml \
                                      --html=reports/api-report.html \
                                      --self-contained-html \
                                      --css=tests/report-theme.css
                                  '
                            ''',
                            returnStatus: true
                        )
                        if (status == 0) {
                            apiTestsStatus = 'PASSED'
                            echo 'API Tests: PASSED'
                        } else {
                            apiTestsStatus = 'FAILED'
                            echo 'API Tests: FAILED'
                        }
                    }
                }
            }
            stage('Pytest Integration Tests') {
                steps {
                    script {
                        def status = sh(
                            script: '''
                                echo "PYTEST INTEGRATION TESTS"
            
                                mkdir -p "$WORKSPACE/reports"
            
                                docker run --rm \
                                  --user 1000:1000 \
                                  --network sapatos-test-net \
                                  -e API_BASE_URL=http://sapatos-backend-test:5000 \
                                  -e JWT_SECRET="$JWT_SECRET" \
                                  -e DB_HOST=sapatos-postgres-test \
                                  -e DB_PORT=5432 \
                                  -e DB_NAME=sapatos_ecommerce \
                                  -e DB_USER=postgres \
                                  -e DB_PASSWORD="$DB_PASSWORD" \
                                  -v jenkins_home:/var/jenkins_home \
                                  -w "$WORKSPACE" \
                                  python:3.12-slim \
                                  sh -c '
                                    python -m venv /tmp/pytest-venv &&
                                    /tmp/pytest-venv/bin/pip install --no-cache-dir -r tests/requirements.txt &&
                                    /tmp/pytest-venv/bin/python -m pytest \
                                      -c tests/pytest.ini \
                                      tests/integration \
                                      -m integration \
                                      -v \
                                      --junitxml=reports/integration-test.xml \
                                      --html=reports/integration-report.html \
                                      --self-contained-html \
                                      --css=tests/report-theme.css
                                  '
                            ''',
                            returnStatus: true
                        )
            
                        if (status == 0) {
                            integrationTestsStatus = 'PASSED'
                            echo 'Integration Tests: PASSED'
                        } else {
                            integrationTestsStatus = 'FAILED'
                            echo 'Integration Tests: FAILED'
                        }
                    }
                }
            }
            stage('Cypress E2E Test') {
                steps {
                    dir('frontend') {
                        script {
                            def status = sh(
                                script: '''
                                    mkdir -p ../reports
            
                                    rm -rf ../reports/mochawesome
                                    mkdir -p ../reports/mochawesome
            
                                    docker run --rm \
                                      --user 1000:1000 \
                                      --network sapatos-test-net \
                                      -e FRONTEND_BASE_URL=http://sapatos-frontend-test:3000 \
                                      -e CYPRESS_API_BASE_URL=http://sapatos-backend-test:5000 \
                                      -v jenkins_home:/var/jenkins_home \
                                      -w "$PWD" \
                                      --entrypoint sh \
                                      cypress/included:16.0.0 \
                                      -c '
                                        npm run test:e2e
                                        TEST_EXIT_CODE=$?
                                        npm run report:merge || true
                                        npm run report:generate || true

                                        exit $TEST_EXIT_CODE
                                      '
                                ''',
                                returnStatus: true
                            )

                            if (status == 0) {
                                e2eTestsStatus = 'PASSED'
                                echo 'E2E Tests: PASSED'
                            } else {
                                e2eTestsStatus = 'FAILED'
                                echo 'E2E Tests: FAILED'
                            }
                        }
                    }
                }
            }
            stage('Build JMeter Image') {
                steps {
                    sh '''
                        echo "Workspace atual:"
                        pwd

                        echo "Conteúdo da raiz:"
                        ls -la

                        echo "Conteúdo da pasta performance:"
                        ls -la performance || true

                        echo "Verificando Dockerfile:"
                        cat performance/Dockerfile.jmeter || true

                        docker build \
                            -t sapatos-jmeter \
                            -f performance/Dockerfile.jmeter \
                             .
                    '''
                }
            }
            stage('JMeter Performance Test') {
                steps {
                    script {
                        def status = sh(
                            script: '''
                                echo "JMETER PERFORMANCE TESTS"

                                rm -rf "$WORKSPACE/reports/jmeter/html"
                                rm -f "$WORKSPACE/reports/jmeter/results.jtl"

                                mkdir -p "$WORKSPACE/reports/jmeter"

                                docker run --rm \
                                    --user 1000:1000 \
                                    --network sapatos-test-net \
                                    -e HOME=/tmp \
                                    -v jenkins_home:/var/jenkins_home \
                                    -w "$WORKSPACE" \
                                    sapatos-jmeter \
                                    -n \
                                    -t performance/smoke-performance.jmx \
                                    -l reports/jmeter/results.jtl \
                                    -e \
                                    -o reports/jmeter/html
                            ''',
                            returnStatus: true
                        )

                        if (status == 0) {
                            performanceTestsStatus = 'PASSED'
                            echo 'JMeter Performance Tests: PASSED'
                        } else {
                            performanceTestsStatus = 'FAILED'
                            echo 'JMeter Performance Tests: FAILED'
                        }
                    }
                }
            }
            stage('Analize JMeter Results'){
                steps {
                    script {
                        def status = sh(
                            script: '''
                                docker run --rm \
                                    --user 1000:1000 \
                                    -v jenkins_home:/var/jenkins_home \
                                    -w "$WORKSPACE" \
                                    python:3.12-slim \
                                    python - <<'PY'
            import csv
            import sys

            file_path = 'reports/jmeter/results.jtl'

            times = []
            errors = 0
            total = 0

            with open(file_path, newline="", encoding="utf-8") as f:
                reader = csv.DictReader(f)
                for row in reader:
                    total += 1

                    elapsed = int(row["elapsed"])
                    sucess = row["success"].lower() == "true"

                    times.append(elapsed)
                    if not sucess:
                        errors += 1
            if total == 0:
                print("No JMeter samples found.")
                sys.exit(1)
            
            times.sort()

            avg = sum(times) / len(times)

            index_p95 = int(len(times) * 0.95) - 1
            index_p95 = max(index_p95, 0)
            
            p95 = times[index_p95]

            error_rate = (errors / total) * 100

            print(f"Total samples: {total}")
            print(f"Errors: {errors}")
            print(f"Error rate: {error_rate:.2f}%")
            print(f"Average response time: {avg:.2f} ms")
            print(f"P95 response time: {p95} ms")

            MAX_ERROR_RATE = 0
            MAX_AVG = 500
            MAX_P95 = 1000

            failed = False
            if error_rate > MAX_ERROR_RATE:
                print(f"FAIL: error rate > {MAX_ERROR_RATE}%")
                failed = True
            
            if avg > MAX_AVG:
                print(f"FAIL: average > {MAX_AVG} ms")
                failed = True

            if p95 > MAX_P95:
                print(f"FAIL: p95 > {MAX_P95} ms")
                failed = True
            
            if failed:
                sys.exit(1)
            
            print("JMeter Performance thresholds passed.")
            PY
                            ''',
                            returnStatus: true
                        )
                        if (status == 0) {
                            performanceTestsStatus = 'PASSED'
                            echo 'JMeter Performance Tests: PASSED'
                        } else {
                            performanceTestsStatus = 'FAILED'
                            echo 'JMeter Performance Tests: FAILED'
                        }
                    }
                }
            }

             stage('Dependency Security Scan') {
                steps {
                    script {

                        sh '''
                            echo "DEPENDENCY SECURITY SCAN"

                            mkdir -p "$WORKSPACE/reports/security"

                            rm -f "$WORKSPACE/reports/security/backend-npm-audit.json"
                            rm -f "$WORKSPACE/reports/security/frontend-npm-audit.json"

                            echo "Scanning backend dependencies..."
                            
                            docker run --rm \
                                --user 1000:1000 \
                                -v jenkins_home:/var/jenkins_home \
                                -w "$WORKSPACE/backend" \
                                node:22-alpine \
                                sh -c 'npm audit --json > ../reports/security/backend-npm-audit.json || true'
                            
                            echo "Scanning frontend dependencies..."

                            docker run --rm \
                                --user 1000:1000 \
                                -v jenkins_home:/var/jenkins_home \
                                -w "$WORKSPACE/frontend" \
                                node:22-alpine \
                                sh -c 'npm audit --json > ../reports/security/frontend-npm-audit.json || true'
                        '''

                        dependencyScanStatus = 'COMPLETED'

                        echo "Dependency Security Scan: COMPLETED"

                    }
                }
            }

            stage('Analyse Dependency Scan') {
                steps { 
                    script {
                        def status = sh(
                            script: '''
                                docker run --rm -i \
                                    --user 1000:1000 \
                                    -v jenkins_home:/var/jenkins_home \
                                    -w "$WORKSPACE" \
                                    node:22-alpine \
                                    node - <<'NODE'
            const fs = require('fs');

            const files = {
                backend: 'reports/security/backend-npm-audit.json',
                frontend: 'reports/security/frontend-npm-audit.json'
            };

            let totalCritical = 0;
            let totalHigh = 0;
            let totalModerate = 0;
            let totalLow = 0;

            for (const [name, file] of Object.entries(files)) {
                if (!fs.existsSync(file)) {
                    console.error(`File not found: ${file}`);
                    process.exit(1);
                }
            
            const audit = JSON.parse(fs.readFileSync(file, 'utf-8'));

            const vulnerabilities = audit.metadata.vulnerabilities || {};
            const critical = vulnerabilities.critical || 0;
            const high = vulnerabilities.high || 0;
            const moderate = vulnerabilities.moderate || 0;
            const low = vulnerabilities.low || 0;
            const total = vulnerabilities.total || 0;

            totalCritical += critical;
            totalHigh += high;
            totalModerate += moderate;
            totalLow += low;

            console.log('');
            console.log(`======= ${name.toUpperCase()} =======`);
            console.log(`Critical     : ${critical}`);
            console.log(`High         : ${high}`);
            console.log(`Moderate     : ${moderate}`);
            console.log(`Low          : ${low}`);
            console.log(`Total        : ${total}`);
            }

            console.log('');
            console.log('======= GLOBAL DEPENDENCY SECURITY =======');
            console.log( `Critical     : ${totalCritical}`);
            console.log( `High         : ${totalHigh}`);
            console.log( `Moderate     : ${totalModerate}`);
            console.log( `Low          : ${totalLow}`);

            if (totalCritical > 0) {
                console.log('');
                console.log('SECURITY RESULT: CRITICAL VULNERABILITIES FOUND');
                process.exit(2);
            }

            console.log('');
            console.log('SECURITY RESULT: NO CRITICAL VULNERABILITIES FOUND');
            
            process.exit(0);
            NODE
                            ''',
                            returnStatus: true
                        )
                        
                        if (status == 0) {
                            dependencySecurityStatus = 'PASSED'
                            echo 'Dependency Security Scan: PASSED'
                        } else if (status == 2) {
                            dependencySecurityStatus = 'FAILED'
                            echo 'Dependency Security Gate: FAILED - critical vulnerabilities detected'
                        } else {
                            dependencySecurityStatus = 'ERROR'
                            echo 'Dependency Scan: ERROR'
                        }
                    }
                }
            }
            stage('Trivy Filesystem Scan') {
                steps {
                    script {
                        def status = sh(
                            script: '''
                                echo "TRIVY FILESYSTEM SCAN"

                                mkdir -p "$WORKSPACE/reports/security"

                                rm -f "$WORKSPACE/reports/security/trivy-filesystem-scan.json"

                                docker run --rm \
                                    --user 1000:1000 \
                                    -v jenkins_home:/var/jenkins_home \
                                    -w "$WORKSPACE" \
                                    -e TRIVY_CACHE_DIR="$WORKSPACE/.trivy-cache" \
                                    aquasec/trivy:latest \
                                    fs \
                                    --cache-dir "$WORKSPACE/.trivy-cache" \
                                    --format json \
                                    --output reports/security/trivy-filesystem.json \
                                    --severity LOW,MEDIUM,HIGH,CRITICAL \
                                    --scanners vuln \
                                    --exit-code 0 \
                                    .
                            ''',
                            returnStatus: true
                        )

                        if (status == 0) {
                            trivyFilesystemScanStatus = 'COMPLETED'
                            echo 'Trivy Filesystem Scan: COMPLETED'
                        } else {
                            trivyFilesystemScanStatus = 'ERROR'
                            echo 'Trivy Filesystem Scan: ERROR'
                        }
                    }
                }
            }
            stage('Analyze Trivy Filesystem') {
                steps {
                    script {
                        def status = sh(
                            script: '''
                                docker run --rm -i \
                                    --user 1000:1000 \
                                    -v jenkins_home:/var/jenkins_home \
                                    -w "$WORKSPACE" \
                                    node:22-alpine \
                                    node - <<'NODE'

                                    const fs = require('fs');

                                    const file = 'reports/security/trivy-filesystem.json';

                                    if (!fs.existsSync(file)) {
                                        console.error(`File not found: ${file}`);
                                        process.exit(1);
                                    }

                                    const report = JSON.parse(fs.readFileSync(file, 'utf-8'));

                                    let critical = 0;
                                    let high = 0;
                                    let medium = 0;
                                    let low = 0;

                                    for (const result of report.Results || []) {
                                        for (const vulnerability of result.Vulnerabilities || []) {

                                            switch ((vulnerability.Severity || '').toUpperCase()) {
                                                case 'CRITICAL':
                                                    critical++;
                                                    break;

                                                case 'HIGH':
                                                    high++;
                                                    break;

                                                case 'MEDIUM':
                                                    medium++;
                                                    break;

                                                case 'LOW':
                                                    low++;
                                                    break;
                                            }
                                        }
                                    }

                                    const total = critical + high + medium + low;

                                    console.log('');
                                    console.log('======= TRIVY FILESYSTEM SECURITY =======');
                                    console.log(`Critical : ${critical}`);
                                    console.log(`High     : ${high}`);
                                    console.log(`Medium   : ${medium}`);
                                    console.log(`Low      : ${low}`);
                                    console.log(`Total    : ${total}`);

                                    if (critical > 0) {
                                        console.log('');
                                        console.log('TRIVY SECURITY RESULT: CRITICAL VULNERABILITIES FOUND');
                                        process.exit(2);
                                    }

                                    console.log('');
                                    console.log('TRIVY SECURITY RESULT: NO CRITICAL VULNERABILITIES FOUND');

                                    process.exit(0);

                                    NODE
                            ''',
                            returnStatus: true
                        )

                        if (status == 0) {
                            trivyFilesystemSecurityStatus = 'PASSED'
                            echo 'Trivy Filesystem Security: PASSED'
                        } else if (status == 2) {
                            trivyFilesystemSecurityStatus = 'FAILED'
                            echo 'Trivy Filesystem Security: FAILED - critical vulnerabilities detected'
                        } else {
                            trivyFilesystemSecurityStatus = 'ERROR'
                            echo 'Trivy Filesystem Security: ERROR'
                        }
                    }
                }
            }
            stage('Build Application Images') {
                steps {
                    sh '''
                        echo "Building application images..."

                        docker build 
                        -t sapatos-backend:${BUILD_NUMBER} \
                         ./backend
                        
                        docker build \
                        --build-arg REACT_APP_API_URL=/api \
                        -t sapatos-frontend:${BUILD_NUMBER} \
                        ./frontend
                    '''
                }
            }
            stage('Trivy Image Scan') {
                steps {
                    script {
                        def status = sh(
                            script: '''
                                echo "TRIVY IMAGE SCAN"

                                mkdir -p "$WORKSPACE/reports/security"
                                mkdir -p "$WORKSPACE/.trivy-cache"

                                rm -f "$WORKSPACE/reports/security/trivy-node.json"
                                rm -f "$WORKSPACE/reports/security/trivy-postgres.json"
                                rm -f "$WORKSPACE/reports/security/trivy-cypress.json"
                                rm -f "$WORKSPACE/reports/security/trivy-jmeter.json"
                                rm -f "$WORKSPACE/reports/security/trivy-python.json"

                                scan_image() {
                                    IMAGE="$1"
                                    OUTPUT="$2"
                                    
                                    echo "Scanning image: $IMAGE"
                                    echo "Output file: $OUTPUT"
                                    
                                    docker run --rm \
                                        -v jenkins_home:/var/jenkins_home \
                                        -v /var/run/docker.sock:/var/run/docker.sock \
                                        -w "$WORKSPACE" \
                                        aquasec/trivy:latest \
                                        image \
                                        --cache-dir "$WORKSPACE/.trivy-image-cache" \
                                        --format json \
                                        --output "reports/security/$OUTPUT" \
                                        --severity LOW,MEDIUM,HIGH,CRITICAL \
                                        --scanners vuln \
                                        --exit-code 0 \
                                        "$IMAGE"
                                }

                                scan_image "node:22-alpine" "trivy-node.json"
                                scan_image "postgres:16-alpine" "trivy-postgres.json"
                                scan_image "cypress/included:16.0.0" "trivy-cypress.json"
                                scan_image "python:3.12-slim" "trivy-python.json"
                                scan_image "sapatos-jmeter" "trivy-jmeter.json"
                                
                            ''',
                            returnStatus: true                        
                        )

                        if (status == 0) {
                            trivyImageScanStatus = 'COMPLETED'
                            echo 'Trivy Image Scan: COMPLETED'
                        } else {
                            trivyImageScanStatus = 'ERROR'
                            echo "Trivy Image Scan: ERROR - exit code ${status}"
                        }
                    }
                }
            }
            stage('Analyze Trivy Image Scan') {
                steps {
                    script {
                        def status = sh(
                            script: '''
                                docker run --rm -i \
                                    --user 1000:1000 \
                                    -v jenkins_home:/var/jenkins_home \
                                    -w "$WORKSPACE" \
                                    node:22-alpine \
                                    node - <<'NODE'

            const fs = require('fs');

            const images = [
                {
                    name: 'NODE',
                    image: 'node:22-alpine',
                    file: 'reports/security/trivy-node.json'
                },
                {
                    name: 'POSTGRES',
                    image: 'postgres:16-alpine',
                    file: 'reports/security/trivy-postgres.json'
                },
                {
                    name: 'CYPRESS',
                    image: 'cypress/included:16.0.0',
                    file: 'reports/security/trivy-cypress.json'
                },
                {
                    name: 'PYTHON',
                    image: 'python:3.12-slim',
                    file: 'reports/security/trivy-python.json'
                },
                {
                    name: 'JMETER',
                    image: 'sapatos-jmeter',
                    file: 'reports/security/trivy-jmeter.json'
                }
            ];

            let globalCritical = 0;
            let globalHigh = 0;
            let globalMedium = 0;
            let globalLow = 0;

            for (const item of images) {

                if (!fs.existsSync(item.file)) {
                    console.error(`File not found: ${item.file}`);
                    process.exit(1);
                }

                const report = JSON.parse(
                    fs.readFileSync(item.file, 'utf-8')
                );

                let critical = 0;
                let high = 0;
                let medium = 0;
                let low = 0;

                for (const result of report.Results || []) {

                    for (const vulnerability of result.Vulnerabilities || []) {

                        switch ((vulnerability.Severity || '').toUpperCase()) {

                            case 'CRITICAL':
                                critical++;
                                break;

                            case 'HIGH':
                                high++;
                                break;

                            case 'MEDIUM':
                                medium++;
                                break;

                            case 'LOW':
                                low++;
                                break;
                        }
                    }
                }

                const total =
                    critical +
                    high +
                    medium +
                    low;

                globalCritical += critical;
                globalHigh += high;
                globalMedium += medium;
                globalLow += low;

                console.log('');
                console.log(`======= ${item.name} =======`);
                console.log(`Image    : ${item.image}`);
                console.log(`Critical : ${critical}`);
                console.log(`High     : ${high}`);
                console.log(`Medium   : ${medium}`);
                console.log(`Low      : ${low}`);
                console.log(`Total    : ${total}`);

                if (critical > 0) {
                    console.log(
                        `Status   : WARNING - ${critical} critical vulnerabilities`
                    );
                } else {
                    console.log('Status   : PASSED');
                }
            }

            const globalTotal =
                globalCritical +
                globalHigh +
                globalMedium +
                globalLow;

            console.log('');
            console.log('======= TRIVY CI IMAGE SUMMARY =======');
            console.log(`Critical : ${globalCritical}`);
            console.log(`High     : ${globalHigh}`);
            console.log(`Medium   : ${globalMedium}`);
            console.log(`Low      : ${globalLow}`);
            console.log(`Total    : ${globalTotal}`);

            console.log('');
            console.log(
                'Policy: CI/tool image vulnerabilities are informational and do not block the application Quality Gate.'
            );

            if (globalCritical > 0) {
                console.log(
                    'TRIVY CI IMAGE RESULT: WARNING - CRITICAL VULNERABILITIES DETECTED'
                );

                // 3 = warning / technical debt
                process.exit(3);
            }

            console.log('');
            console.log(
                'TRIVY CI IMAGE RESULT: PASSED - NO CRITICAL VULNERABILITIES FOUND'
            );

            process.exit(0);

            NODE
                            ''',
                            returnStatus: true
                        )

                        if (status == 0) {

                            trivyImageSecurityStatus = 'PASSED'
                            echo 'Trivy CI Image Security: PASSED'

                        } else if (status == 3) {

                            trivyImageSecurityStatus = 'WARNING'
                            echo 'Trivy CI Image Security: WARNING - vulnerabilities detected in CI/tool images'

                        } else {

                            trivyImageSecurityStatus = 'ERROR'
                            echo 'Trivy CI Image Security: ERROR'
                        }
                    }
                }
            }
            stage('Generate Qa Dashboard') {
                steps {
                    script {
                        def qualityGateStatus =
                            apiTestsStatus == 'PASSED' &&
                            integrationTestsStatus == 'PASSED' &&
                            e2eTestsStatus == 'PASSED' &&
                            performanceTestsStatus == 'PASSED' &&
                            trivyFilesystemScanStatus == 'COMPLETED' &&
                            dependencySecurityStatus == 'PASSED' &&
                            trivyFilesystemSecurityStatus == 'PASSED'
                            ? 'PASSED'
                            : 'FAILED'
                echo "===== DASHBOARD STATUS ====="
                echo "API: ${apiTestsStatus}"
                echo "Integration: ${integrationTestsStatus}"
                echo "E2E: ${e2eTestsStatus}"
                echo "Performance: ${performanceTestsStatus}"
                echo "Dependency Security: ${dependencySecurityStatus}"
                echo "Trivy Filesystem Scan: ${trivyFilesystemScanStatus}"
                echo "Trivy Filesystem Security: ${trivyFilesystemSecurityStatus}"
                echo "Trivy Image Scan: ${trivyImageScanStatus}"
                echo "Trivy Image Security: ${trivyImageSecurityStatus}"
                echo "Trivy CI Image Security: ${trivyImageSecurityStatus}"

                        writeFile file: 'reports/qa-dashboard.html', text: """
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>QA Dashboard</title>
</head>
<body>

    <h1>QA Dashboard</h1>

    <p>Job: ${env.JOB_NAME}</p>
    <p>Build: ${env.BUILD_NUMBER}</p>

    <h2>Test Results</h2>

    <p>API Tests: ${apiTestsStatus}</p>
    <p>Integration Tests: ${integrationTestsStatus}</p>
    <p>E2E Tests: ${e2eTestsStatus}</p>
    <p>Performance Tests: ${performanceTestsStatus}</p>
    <p>Dependency Scan: ${dependencyScanStatus}</p>
    <p>Dependency Security: ${dependencySecurityStatus}</p>
    <p>Trivy Filesystem: ${trivyFilesystemScanStatus}</p>
    <p>Trivy Filesystem Security: ${trivyFilesystemSecurityStatus}</p>
    <p>Trivy Image Scan: ${trivyImageScanStatus}</p>
    <p>Trivy Image Security: ${trivyImageSecurityStatus}</p>
    <p>Trivy CI Image Security: ${trivyImageSecurityStatus}</p>

    <h2>Quality Gate</h2>

    <p>${qualityGateStatus}</p>

</body>
</html>
"""
                    }
                }
            }
            stage('Quality Gate') {
                steps {
                    script {

                        echo "QUALITY GATE"

                        echo "API Tests:                  ${apiTestsStatus}"
                        echo "Integration Tests:          ${integrationTestsStatus}"
                        echo "E2E Tests:                  ${e2eTestsStatus}"
                        echo "Performance Tests:          ${performanceTestsStatus}"
                        echo "Dependency Security:        ${dependencySecurityStatus}"
                        echo "Trivy Filesystem Security:  ${trivyFilesystemSecurityStatus}"

                        echo "-----------------------------------------"
                        echo "CI IMAGE SECURITY (informational only)"
                        echo "Trivy Image Scan:           ${trivyImageScanStatus}"
                        echo "Trivy CI Image Security:    ${trivyImageSecurityStatus}"
                        echo "-----------------------------------------"

                        if (
                            apiTestsStatus != 'PASSED' ||
                            integrationTestsStatus != 'PASSED' ||
                            e2eTestsStatus != 'PASSED' ||
                            performanceTestsStatus != 'PASSED' ||
                            dependencySecurityStatus != 'PASSED' ||
                            trivyFilesystemSecurityStatus != 'PASSED'
                        ) {
                            error('QUALITY GATE FAILED')
                        }

                        echo "QUALITY GATE PASSED"
                    }
                }
            }
        }
        post {
            always {
                junit testResults: 'reports/*.xml',
                      allowEmptyResults: true

                archiveArtifacts artifacts: 'frontend/cypress/screenshots/**/*.png',
                                 allowEmptyArchive: true

                archiveArtifacts artifacts: 'reports/mochawesome/**/*.html',
                                 allowEmptyArchive: true

                archiveArtifacts artifacts: 'reports/*.html',
                                 allowEmptyArchive: true
                
                archiveArtifacts artifacts: 'reports/security/trivy-filesystem.json',
                 allowEmptyArchive: true
                
                archiveArtifacts(
                    artifacts: 'reports/security/*.json',
                    allowEmptyArchive: true
                )
                publishHTML(target: [
                    reportDir: 'reports/mochawesome',
                    reportFiles: 'cypress-report.html',
                    reportName: 'Relatório Cypress',
                    keepAll: true,
                    alwaysLinkToLastBuild: true,
                    allowMissing: true
                ])

                publishHTML(target: [
                    reportDir: 'reports',
                    reportFiles: 'api-report.html', 
                    reportName: 'Relatório Pytest API',
                    keepAll: true,
                    alwaysLinkToLastBuild: true,
                    allowMissing: true
                ])

                publishHTML(target: [
                    reportDir: 'reports',
                    reportFiles: 'integration-report.html',
                    reportName: 'Relatório Pytest Integration',
                    keepAll: true,
                    alwaysLinkToLastBuild: true,
                    allowMissing: true
                ])

                publishHTML(target: [
                    reportDir: 'reports',
                    reportFiles: 'qa-dashboard.html',
                    reportName: 'QA Dashboard',
                    keepAll: true,
                    alwaysLinkToLastBuild: true,
                    allowMissing: true
                ])

                publishHTML(target: [
                    reportDir: 'reports/jmeter/html',
                    reportFiles: 'index.html',
                    reportName: 'Relatório JMeter',
                    keepAll: true,
                    alwaysLinkToLastBuild: true,
                    allowMissing: true
                ])

                sh '''
                    echo "Cleaning test environment..."

                    docker rm -f sapatos-frontend-test 2>/dev/null || true
                    docker rm -f sapatos-backend-test 2>/dev/null || true
                    docker rm -f sapatos-postgres-test 2>/dev/null || true
                '''
            }
            failure {
                mail to: 'michelrviana@gmail.com',
                     subject: "Falha: ${env.JOB_NAME} #${env.BUILD_NUMBER}",
                     body: """
                     Michel, olhe a pipeline, pois falhou.

                     Job: ${env.JOB_NAME}
                     Build: ${env.BUILD_NUMBER}

                     ${env.BUILD_URL}
                     """
            }
        }
    }