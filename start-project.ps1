# Script PowerShell para iniciar o projeto Sapatos E-commerce no Windows
# Este script instala dependências, configura o banco e inicia o backend e frontend

Write-Host "🚀 Iniciando projeto Sapatos E-commerce..." -ForegroundColor Green

# Verificar se Node.js está instalado
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Node.js não encontrado. Instale o Node.js primeiro." -ForegroundColor Red
    exit 1
}

# Verificar se PostgreSQL está instalado (opcional, assume que está rodando)
if (-not (Get-Command psql -ErrorAction SilentlyContinue)) {
    Write-Host "⚠️ PostgreSQL não encontrado. Pule a etapa de schema ou adicione o caminho do psql ao PATH." -ForegroundColor Yellow
} else {
    Write-Host "🗄️ PostgreSQL encontrado." -ForegroundColor Green
}

# Instalar dependências do backend
Write-Host "📦 Instalando dependências do backend..." -ForegroundColor Cyan
Set-Location "backend"
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erro ao instalar dependências do backend." -ForegroundColor Red
    exit 1
}

# Instalar dependências do frontend
Write-Host "📦 Instalando dependências do frontend..." -ForegroundColor Cyan
Set-Location "..\frontend"
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erro ao instalar dependências do frontend." -ForegroundColor Red
    exit 1
}

# Configurar banco de dados (executar schema)
Write-Host "🗄️ Configurando banco de dados..." -ForegroundColor Cyan
Set-Location "..\database"
psql -f schema.sql
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erro ao configurar banco de dados. Verifique se PostgreSQL está rodando." -ForegroundColor Red
    exit 1
}

# Iniciar backend em background
Write-Host "🔧 Iniciando backend..." -ForegroundColor Cyan
Set-Location "..\backend"
Start-Process -NoNewWindow -FilePath "npm.cmd" -ArgumentList "start" -WorkingDirectory (Get-Location)

# Aguardar um pouco para o backend iniciar
Start-Sleep -Seconds 5

# Iniciar frontend em background
Write-Host "🌐 Iniciando frontend..." -ForegroundColor Cyan
Set-Location "..\frontend"
Start-Process -NoNewWindow -FilePath "npm.cmd" -ArgumentList "start" -WorkingDirectory (Get-Location)

# Voltar para raiz
Set-Location ".."

Write-Host "✅ Projeto iniciado com sucesso!" -ForegroundColor Green
Write-Host "📱 Frontend: http://localhost:3000" -ForegroundColor Yellow
Write-Host "🔧 Backend: http://localhost:5000" -ForegroundColor Yellow
Write-Host "Pressione Ctrl+C para parar os serviços." -ForegroundColor Gray

# Manter o script rodando para manter os processos
try {
    while ($true) {
        Start-Sleep -Seconds 1
    }
} catch {
    Write-Host "🛑 Parando serviços..." -ForegroundColor Red
    # Aqui você poderia adicionar comandos para parar os processos se necessário
}