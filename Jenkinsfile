
def apiTestsStatus = 'NOT_RUN'
def integrationTestsStatus = 'NOT_RUN'
def e2eTestsStatus = 'NOT_RUN'


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
                                      cypress/included:14.5.4 \
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
                        docker build \
                            -t sapatos-jmeter \
                            -f performance/Dockerfile.jmeter \
                             .
                    '''
                }
            }
            stage('JMeter Performance Test') {
                steps {
                    sh '''
                        mkdir -p "$WORKSPACE/reports/jmeter"

                        docker run --rm \
                            --network sapatos-test-net \
                            -v "$WORKSPACE:/workspace" \
                            -w /workspace \
                            sapatos-jmeter \
                            -n \
                            -t performance/smoke-performance.jmx \
                            -l reports/jmeter/results.jtl \
                            -e \
                            -o reports/jmeter/html
                    '''
                }
            }
            stage('Quality Gate') {
                steps {
                    script {
                       
                        echo "QUALITY GATE"
                     
                        echo "API Tests:         ${apiTestsStatus}"
                        echo "Integration Tests: ${integrationTestsStatus}"
                        echo "E2E Tests:         ${e2eTestsStatus}"
            
                        if (
                            apiTestsStatus != 'PASSED' ||
                            integrationTestsStatus != 'PASSED' ||
                            e2eTestsStatus != 'PASSED'
                        ) {
                            error('QUALITY GATE FAILED')
                        }
            
                        echo "QUALITY GATE PASSED"
            
                    }
                }
            }
            stage('Generate Qa Dashboard') {
                steps {
                    script {
                        def qualityGateStatus =
                            apiTestsStatus == 'PASSED' &&
                            integrationTestsStatus == 'PASSED' &&
                            e2eTestsStatus == 'PASSED'
                            ? 'PASSED'
                            : 'FAILED'

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

    <h2>Quality Gate</h2>

    <p>${qualityGateStatus}</p>

</body>
</html>
"""

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
                     A pipeline falhou.

                     Job: ${env.JOB_NAME}
                     Build: ${env.BUILD_NUMBER}

                     ${env.BUILD_URL}
                     """
            }
        }
    }