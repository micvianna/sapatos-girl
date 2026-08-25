pipeline {
    agent any

    environment {
        API_BASE_URL = 'http://localhost:5000'
        FRONTEND_BASE_URL = 'http://localhost:3000'
        FRONTEND_ORIGIN = 'http://sapatos-frontend-test:3000'
        CYPRESS_API_BASE_URL = 'http://localhost:5000'
        DB_HOST = 'localhost'
        DB_PORT = '5432'
        DB_NAME = 'sapatos_ecommerce'
        DB_USER = 'postgres'
        JWT_EXPIRE = '1h'
        CORS_ORIGIN = 'http://localhost:3000,http://sapatos-frontend-test:3000'
        REACT_APP_API_URL = 'http://localhost:5000'
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Install Dependencies') {
            steps {
                sh 'mkdir -p reports'
                sh 'npm ci'
                sh 'npm --prefix backend ci'
                sh 'npm --prefix frontend ci'
                sh 'python3 -m venv .venv-qa'
                sh '.venv-qa/bin/python -m pip install -r tests/requirements.txt'
            }
        }

        stage('Start Application') {
            steps {
                sh '''
                    test -n "$DB_PASSWORD" || (echo "DB_PASSWORD deve ser configurada no job Jenkins" && exit 1)
                    test -n "$JWT_SECRET" || (echo "JWT_SECRET deve ser configurada no job Jenkins" && exit 1)
                '''
                sh 'docker compose -f docker-compose.test.yml up -d --wait'
                sh '''
                    nohup npm --prefix backend start > reports/backend.log 2>&1 &
                    echo $! > reports/backend.pid
                    nohup env -u ELECTRON_RUN_AS_NODE npm --prefix frontend start > reports/frontend.log 2>&1 &
                    echo $! > reports/frontend.pid
                '''
                sh '''
                    for attempt in $(seq 1 30); do
                        curl --fail --silent "$API_BASE_URL/api/health" && break
                        if [ "$attempt" -eq 30 ]; then exit 1; fi
                        sleep 2
                    done
                    for attempt in $(seq 1 60); do
                        curl --fail --silent "$FRONTEND_BASE_URL" > /dev/null && break
                        if [ "$attempt" -eq 60 ]; then exit 1; fi
                        sleep 2
                    done
                '''
            }
        }

        stage('Build Frontend') {
            steps {
                sh 'npm --prefix frontend run build'
            }
        }

        stage('API Tests') {
            steps {
                catchError(buildResult: 'FAILURE', stageResult: 'FAILURE') {
                    sh '.venv-qa/bin/python -m pytest -c tests/pytest.ini tests/api -v --junitxml=reports/api-tests.xml --html=reports/api-tests.html --self-contained-html'
                }
            }
        }

        stage('Integration Tests') {
            steps {
                catchError(buildResult: 'FAILURE', stageResult: 'FAILURE') {
                    sh '.venv-qa/bin/python -m pytest -c tests/pytest.ini tests/integration -m integration -v --junitxml=reports/integration-tests.xml --html=reports/integration-tests.html --self-contained-html'
                }
            }
        }

        stage('E2E Tests') {
            steps {
                catchError(buildResult: 'FAILURE', stageResult: 'FAILURE') {
                    sh 'env -u ELECTRON_RUN_AS_NODE npm --prefix frontend run test:e2e'
                }
            }
        }
    }

    post {
        always {
            junit allowEmptyResults: true, testResults: 'reports/*.xml'
            archiveArtifacts allowEmptyArchive: true, artifacts: 'reports/**/*.html, reports/**/*.json, reports/*.log, reports/*.xml, frontend/cypress/screenshots/**/*'
            sh '''
                if [ -f reports/backend.pid ]; then kill "$(cat reports/backend.pid)" || true; fi
                if [ -f reports/frontend.pid ]; then kill "$(cat reports/frontend.pid)" || true; fi
                docker compose -f docker-compose.test.yml down --volumes || true
            '''
        }
    }
}
