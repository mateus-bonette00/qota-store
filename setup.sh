#!/bin/bash

# ==========================================
# Script de Setup - Qota Finance
# Sistema de Controle Financeiro FBA Amazon
# ==========================================

echo "🚀 Iniciando setup do Qota Finance..."
echo ""

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Função para printar mensagens coloridas
print_success() {
  echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
  echo -e "${RED}❌ $1${NC}"
}

print_info() {
  echo -e "${YELLOW}ℹ️  $1${NC}"
}

# Verificar se Node.js está instalado
if ! command -v node &> /dev/null; then
  print_error "Node.js não está instalado. Por favor, instale Node.js 18+ primeiro."
  exit 1
fi

print_success "Node.js $(node -v) detectado"

# Verificar se PostgreSQL está acessível
if ! command -v psql &> /dev/null; then
  print_info "PostgreSQL CLI não detectado localmente. Você pode usar Neon ou outro serviço cloud."
else
  print_success "PostgreSQL detectado"
fi

# ==========================================
# 1. CRIAR ESTRUTURA DO PROJETO
# ==========================================
echo ""
print_info "Criando estrutura de pastas..."

# Criar diretórios do backend
mkdir -p backend/src/{config,controllers,models,routes,middlewares,services,utils}
mkdir -p backend/src/database/{migrations,seeds}

# Criar arquivos vazios do backend
touch backend/src/server.ts
touch backend/src/app.ts
touch backend/src/config/{database.ts,env.ts}
touch backend/src/controllers/{gastos,investimentos,produtos,amazon,metrics}.controller.ts
touch backend/src/models/{gasto,investimento,produto,receita,amazon}.model.ts
touch backend/src/routes/{index,gastos,investimentos,produtos,amazon,metrics}.routes.ts
touch backend/src/services/{gastos,investimentos,produtos,amazon,metrics}.service.ts
touch backend/src/middlewares/{error,validation}.middleware.ts
touch backend/src/utils/{logger,helpers}.ts
touch backend/.env.example
touch backend/.gitignore

print_success "Estrutura do backend criada"

# ==========================================
# 2. INSTALAR DEPENDÊNCIAS DO BACKEND
# ==========================================
echo ""
print_info "Instalando dependências do backend..."
cd backend

# Criar package.json
cat > package.json << 'EOF'
{
  "name": "qota-finance-backend",
  "version": "1.0.0",
  "description": "API Backend para Qota Finance",
  "main": "dist/server.js",
  "scripts": {
    "dev": "nodemon --exec ts-node src/server.ts",
    "build": "tsc",
    "start": "node dist/server.js",
    "migrate": "psql $DATABASE_URL -f src/database/migrations/001_create_tables.sql"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
    "pg": "^8.11.3",
    "helmet": "^7.1.0",
    "morgan": "^1.10.0",
    "express-validator": "^7.0.1"
  },
  "devDependencies": {
    "@types/node": "^20.10.0",
    "@types/express": "^4.17.21",
    "@types/cors": "^2.8.17",
    "@types/morgan": "^1.9.9",
    "@types/pg": "^8.10.9",
    "nodemon": "^3.0.2",
    "ts-node": "^10.9.2",
    "typescript": "^5.3.3"
  }
}
EOF

print_success "package.json criado"

# Instalar dependências
npm install
print_success "Dependências do backend instaladas"

# Criar tsconfig.json
cat > tsconfig.json << 'EOF'
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "moduleResolution": "node"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
EOF

print_success "tsconfig.json criado"

# Criar .env.example
cat > .env.example << 'EOF'
NODE_ENV=development
PORT=8000
DATABASE_URL=postgresql://user:password@localhost:5432/qota_finance
ALLOWED_ORIGINS=http://localhost:4200
JWT_SECRET=your_secret_key_here
EOF

print_success ".env.example criado"

# Criar .gitignore
cat > .gitignore << 'EOF'
node_modules/
dist/
.env
*.log
.DS_Store
EOF

cd ..

# ==========================================
# 3. CRIAR PROJETO ANGULAR
# ==========================================
echo ""
print_info "Criando projeto Angular..."

# Verificar se Angular CLI está instalado
if ! command -v ng &> /dev/null; then
  print_info "Instalando Angular CLI globalmente..."
  sudo npm install -g @angular/cli@15
fi

print_success "Angular CLI detectado"

# Criar projeto
ng new frontend --routing --style=scss --skip-git --package-manager=npm

cd frontend

# Instalar dependências adicionais
npm install chart.js ng2-charts
npm install -D tailwindcss postcss autoprefixer

# Inicializar Tailwind
npx tailwindcss init

print_success "Projeto Angular criado"

# ==========================================
# 4. CONFIGURAR TAILWIND
# ==========================================
print_info "Configurando Tailwind CSS..."

cat > tailwind.config.js << 'EOF'
module.exports = {
  content: ["./src/**/*.{html,ts}"],
  theme: {
    extend: {
      colors: {
        primary: '#2F529E',
        accent: '#FE0000',
        bg1: '#0a122b',
        bg2: '#0d1735',
      },
      fontFamily: {
        sans: ['Poppins', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
EOF

# Adicionar imports do Tailwind no styles.scss
cat > src/styles.scss << 'EOF'
@import 'tailwindcss/base';
@import 'tailwindcss/components';
@import 'tailwindcss/utilities';

@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700;800;900&display=swap');

* {
  font-family: 'Poppins', system-ui, sans-serif;
}

body {
  margin: 0;
  background: linear-gradient(180deg, #0a122b 0%, #0d1735 50%, #0a122b 100%);
  color: #e9eef9;
  min-height: 100vh;
}
EOF

print_success "Tailwind CSS configurado"

# ==========================================
# 5. CRIAR ESTRUTURA ANGULAR
# ==========================================
print_info "Criando estrutura do Angular..."

cd src/app

# Módulos
ng generate module core --module=app
ng generate module shared --module=app
ng generate module features --routing

# Layout components
ng generate component layout/header --skip-tests
ng generate component layout/sidebar --skip-tests  
ng generate component layout/main-layout --skip-tests

# Feature components
ng generate component features/dashboard --skip-tests
ng generate component features/receitas --skip-tests
ng generate component features/despesas --skip-tests
ng generate component features/produtos --skip-tests
ng generate component features/graficos --skip-tests

# Services
ng generate service core/services/api --skip-tests
ng generate service core/services/metrics --skip-tests
ng generate service core/services/gastos --skip-tests
ng generate service core/services/produtos --skip-tests

# Models
mkdir -p core/models
touch core/models/{gasto,investimento,produto,receita,metrics}.model.ts

# Environments
mkdir -p ../environments

cat > ../environments/environment.ts << 'EOF'
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8000/api'
};
EOF

cat > ../environments/environment.prod.ts << 'EOF'
export const environment = {
  production: true,
  apiUrl: '/api'
};
EOF

print_success "Estrutura Angular criada"

cd ../../../..

# ==========================================
# 6. INSTRUÇÕES FINAIS
# ==========================================
echo ""
echo "=========================================="
print_success "Setup concluído com sucesso!"
echo "=========================================="
echo ""
print_info "Próximos passos:"
echo ""
echo "1. Configurar banco de dados:"
echo "   cd backend"
echo "   cp .env.example .env"
echo "   # Edite o .env com suas credenciais do PostgreSQL"
echo "   npm run migrate"
echo ""
echo "2. Iniciar o backend:"
echo "   cd backend"
echo "   npm run dev"
echo "   # Servidor rodará em http://localhost:8000"
echo ""
echo "3. Iniciar o frontend:"
echo "   cd frontend"
echo "   ng serve"
echo "   # App rodará em http://localhost:4200"
echo ""
print_info "Arquivos de código foram gerados. Cole os códigos dos artifacts nos arquivos correspondentes."
echo ""
print_success "Bom desenvolvimento! 🚀"
