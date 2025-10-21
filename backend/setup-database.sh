#!/bin/bash
# Script para configurar o banco de dados PostgreSQL

echo "🔧 Configurando banco de dados PostgreSQL..."
echo ""

# Criar banco e usuário
sudo -u postgres psql << EOF
-- Criar banco (se não existir)
SELECT 'CREATE DATABASE qota_finance'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'qota_finance')\gexec

-- Criar usuário (se não existir)
DO \$\$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_user WHERE usename = 'qota_user') THEN
    CREATE USER qota_user WITH PASSWORD 'papabento123';
  END IF;
END
\$\$;

-- Dar permissões
GRANT ALL PRIVILEGES ON DATABASE qota_finance TO qota_user;

-- Conectar ao banco e dar permissões no schema
\c qota_finance
GRANT ALL ON SCHEMA public TO qota_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO qota_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO qota_user;

-- Confirmar
\du qota_user
\l qota_finance
EOF

echo ""
echo "✅ Banco de dados configurado com sucesso!"
echo ""
echo "📊 Informações:"
echo "   Banco: qota_finance"
echo "   Usuário: qota_user"
echo "   Senha: papabento123"
echo "   Host: localhost"
echo "   Porta: 5432"
echo ""
