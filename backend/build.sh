#!/bin/bash
# Script de build para o Render.com

echo "📦 Instalando dependências..."
npm install

echo "🔨 Compilando TypeScript..."
npm run build

echo "✅ Build concluído!"
