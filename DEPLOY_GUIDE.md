# 🚀 GUIA COMPLETO DE DEPLOY - QOTA FINANCE

Este guia vai te ensinar a colocar seu projeto **100% NO AR DE FORMA GRATUITA**!

---

## 📋 O QUE VOCÊ VAI PRECISAR

1. ✅ Domínio qotastore.lol (você já tem!)
2. ✅ Conta no GitHub (vamos criar se você não tiver)
3. ✅ Conta no Render.com (gratuito - vamos criar)
4. ✅ Conta no Vercel (gratuito - vamos criar)
5. ✅ 30-40 minutos do seu tempo

---

## 🎯 VISÃO GERAL

Vamos fazer isso em 7 etapas:

```
1. Subir código para GitHub
2. Criar banco de dados PostgreSQL gratuito (Render)
3. Fazer deploy do Backend (Render)
4. Fazer deploy do Frontend (Vercel)
5. Configurar domínio qotastore.lol
6. Testar tudo funcionando
7. Ajustes finais
```

---

# PARTE 1: GITHUB (15 minutos)

## Passo 1.1 - Criar conta no GitHub (se não tiver)

1. Acesse: https://github.com/signup
2. Preencha com seu email
3. Crie uma senha forte
4. Escolha um username
5. Verifique seu email
6. ✅ Pronto! Conta criada

## Passo 1.2 - Criar repositório

1. Acesse: https://github.com/new
2. Preencha:
   - **Repository name**: `qota-finance`
   - **Description**: `Sistema de controle financeiro FBA Amazon`
   - **Visibility**: Marque **Public** (necessário para planos gratuitos)
3. **NÃO marque** "Add a README file"
4. Clique em **"Create repository"**
5. ✅ Repositório criado!

## Passo 1.3 - Subir código para o GitHub

Abra o terminal na pasta do projeto e execute estes comandos **UM POR VEZ**:

```bash
# 1. Inicializar git (se ainda não foi inicializado)
git init

# 2. Adicionar todos os arquivos
git add .

# 3. Fazer primeiro commit
git commit -m "Initial commit - Qota Finance"

# 4. Adicionar o repositório remoto
# ⚠️ ATENÇÃO: Substitua 'SEU-USERNAME' pelo seu username do GitHub!
git remote add origin https://github.com/SEU-USERNAME/qota-finance.git

# 5. Enviar código para o GitHub
git branch -M master
git push -u origin master
```

**Ele vai pedir seu username e senha do GitHub. Digite e aperte Enter.**

> 💡 **DICA**: Se pedir token ao invés de senha:
> - Vá em: https://github.com/settings/tokens
> - Clique em "Generate new token (classic)"
> - Selecione "repo"
> - Clique em "Generate token"
> - Copie o token e use como senha

✅ **Código agora está no GitHub!**

---

# PARTE 2: BANCO DE DADOS (10 minutos)

## Passo 2.1 - Criar conta no Render

1. Acesse: https://render.com/
2. Clique em **"Get Started for Free"**
3. Escolha **"Sign up with GitHub"** (mais fácil!)
4. Autorize o Render a acessar sua conta GitHub
5. ✅ Conta criada!

## Passo 2.2 - Criar banco de dados PostgreSQL

1. No dashboard do Render, clique em **"New +"** (canto superior direito)
2. Selecione **"PostgreSQL"**
3. Preencha:
   - **Name**: `qota-finance-db`
   - **Database**: `qota_finance`
   - **User**: `qota_user` (ou deixe o padrão)
   - **Region**: Escolha **"Frankfurt (EU Central)"** (mais próximo)
   - **PostgreSQL Version**: Deixe a versão mais recente
   - **Plan**: Selecione **"Free"** 🎉
4. Clique em **"Create Database"**
5. **AGUARDE 2-3 minutos** enquanto o banco é criado
6. ✅ Banco de dados criado!

## Passo 2.3 - Copiar credenciais do banco

1. Na página do banco de dados, role até **"Connections"**
2. Você verá várias informações. **COPIE** e salve em um bloco de notas:
   - **Internal Database URL** (vamos usar essa!)
   - Deve ser algo como: `postgresql://usuario:senha@host/database`

⚠️ **IMPORTANTE**: Guarde essa URL! Vamos usar em breve.

---

# PARTE 3: DEPLOY DO BACKEND (15 minutos)

## Passo 3.1 - Criar Web Service no Render

1. No dashboard do Render, clique em **"New +"**
2. Selecione **"Web Service"**
3. Clique em **"Connect a repository"**
4. Se não aparecer seu repositório:
   - Clique em **"Configure account"**
   - Autorize o Render a acessar seus repositórios
   - Selecione **"Only select repositories"**
   - Escolha **"qota-finance"**
   - Clique em **"Install"**
5. Agora selecione o repositório **"qota-finance"**
6. ✅ Repositório conectado!

## Passo 3.2 - Configurar o Backend

Preencha os campos:

- **Name**: `qota-finance-api`
- **Region**: **"Frankfurt (EU Central)"** (mesma do banco!)
- **Branch**: `master`
- **Root Directory**: `backend` ⚠️ IMPORTANTE!
- **Runtime**: **"Node"**
- **Build Command**:
  ```
  npm install && npm run build
  ```
- **Start Command**:
  ```
  npm start
  ```
- **Plan**: Selecione **"Free"** 🎉

## Passo 3.3 - Configurar Variáveis de Ambiente

Role até **"Environment Variables"** e adicione:

Clique em **"Add Environment Variable"** para cada uma:

1. **NODE_ENV**
   - Value: `production`

2. **PORT**
   - Value: `8000`

3. **DATABASE_URL**
   - Value: Cole aqui a **Internal Database URL** que você copiou antes
   - Exemplo: `postgresql://qota_user:senha123@dpg-xxxxx.frankfurt-postgres.render.com/qota_finance`

4. **ALLOWED_ORIGINS**
   - Value: `https://qotastore.lol,https://www.qotastore.lol`
   - (vamos adicionar a URL da Vercel depois)

5. **JWT_SECRET**
   - Value: Crie uma senha aleatória forte, exemplo: `minhaSenhaSecreta123!@#QotaStore2025`

## Passo 3.4 - Fazer Deploy

1. Clique em **"Create Web Service"** (botão verde no final da página)
2. **AGUARDE 5-10 minutos** - O Render vai:
   - Baixar seu código
   - Instalar dependências
   - Compilar TypeScript
   - Iniciar servidor
3. Você verá logs aparecendo na tela
4. Quando aparecer **"Deploy live ✅"** está pronto!

## Passo 3.5 - Executar Migrations do Banco

1. Na página do seu serviço, clique na aba **"Shell"** (menu lateral esquerdo)
2. Se não tiver "Shell", clique em **"Events"** e aguarde o deploy terminar
3. Depois que o deploy terminar, vá em **"Shell"**
4. Digite este comando e aperte Enter:
   ```bash
   npm run migrate
   ```
5. Aguarde até aparecer "✅ Todas as migrations foram executadas!"
6. ✅ Banco de dados configurado!

## Passo 3.6 - Testar Backend

1. No topo da página do serviço, você verá uma URL tipo:
   - `https://qota-finance-api.onrender.com`
2. **COPIE** essa URL
3. Abra no navegador: `https://qota-finance-api.onrender.com/health`
4. Deve aparecer algo como:
   ```json
   {
     "status": "ok",
     "timestamp": "2025-10-21T...",
     "uptime": 123.45
   }
   ```
5. ✅ Backend funcionando!

⚠️ **GUARDE ESSA URL** - vamos usar no frontend!

---

# PARTE 4: DEPLOY DO FRONTEND (10 minutos)

## Passo 4.1 - Criar conta na Vercel

1. Acesse: https://vercel.com/signup
2. Clique em **"Continue with GitHub"**
3. Autorize a Vercel
4. ✅ Conta criada!

## Passo 4.2 - Importar Projeto

1. No dashboard da Vercel, clique em **"Add New..."**
2. Selecione **"Project"**
3. Na lista, encontre **"qota-finance"**
4. Clique em **"Import"**

## Passo 4.3 - Configurar Frontend

Preencha:

- **Project Name**: `qota-finance`
- **Framework Preset**: Selecione **"Angular"**
- **Root Directory**: Clique em **"Edit"** e digite `frontend`
- **Build Command**: Deixe o padrão `npm run build`
- **Output Directory**: `dist/frontend`

## Passo 4.4 - NÃO adicione variáveis de ambiente ainda

1. Role até o final
2. Clique em **"Deploy"** (botão azul)
3. **AGUARDE 3-5 minutos**
4. Quando aparecer a animação de confete 🎉, está pronto!

## Passo 4.5 - Atualizar URL do Backend no código

Agora precisamos atualizar a URL da API no frontend:

1. **Volte para o terminal** na sua máquina
2. Abra o arquivo de produção:
   ```bash
   # Edite o arquivo (use seu editor favorito, vim, nano, vscode, etc)
   # O arquivo está em: frontend/src/environments/environment.prod.ts
   ```

3. Altere para:
   ```typescript
   export const environment = {
     production: true,
     apiUrl: 'https://SUA-URL-DO-RENDER.onrender.com/api',
     wsUrl: 'wss://SUA-URL-DO-RENDER.onrender.com'
   };
   ```

   ⚠️ **Substitua** `SUA-URL-DO-RENDER.onrender.com` pela URL que você copiou antes!

   Exemplo:
   ```typescript
   export const environment = {
     production: true,
     apiUrl: 'https://qota-finance-api.onrender.com/api',
     wsUrl: 'wss://qota-finance-api.onrender.com'
   };
   ```

4. Salve o arquivo

5. No terminal, execute:
   ```bash
   git add .
   git commit -m "Update production API URL"
   git push
   ```

6. A Vercel vai detectar automaticamente e fazer **re-deploy** (2-3 minutos)

## Passo 4.6 - Pegar URL do Frontend

1. Volte para o dashboard da Vercel
2. Você verá uma URL tipo: `https://qota-finance.vercel.app`
3. **COPIE** essa URL
4. Clique nela para testar - seu site deve abrir! 🎉

---

# PARTE 5: ATUALIZAR CORS NO BACKEND (5 minutos)

Agora precisamos permitir que o frontend acesse o backend:

## Passo 5.1 - Adicionar URL do Frontend no CORS

1. Volte para o **Render.com**
2. Acesse seu serviço **"qota-finance-api"**
3. No menu lateral, clique em **"Environment"**
4. Encontre a variável **"ALLOWED_ORIGINS"**
5. Clique em **"Edit"** (lápis)
6. **ADICIONE** a URL da Vercel separada por vírgula:
   ```
   https://qotastore.lol,https://www.qotastore.lol,https://qota-finance.vercel.app
   ```
7. Clique em **"Save Changes"**
8. O serviço vai reiniciar automaticamente (1-2 minutos)

✅ Agora frontend e backend podem se comunicar!

---

# PARTE 6: CONFIGURAR DOMÍNIO qotastore.lol (15 minutos)

## Passo 6.1 - Configurar DNS no Porkbun

1. Acesse: https://porkbun.com/account/domainsSpeedy
2. Clique no domínio **"qotastore.lol"**
3. Clique na aba **"DNS Records"**
4. **DELETE todos os registros existentes** (se houver)

## Passo 6.2 - Adicionar registros DNS para o Frontend (Vercel)

Vamos adicionar 2 registros para apontar seu domínio para a Vercel:

**Registro 1 - CNAME para www:**
- Clique em **"Add Record"**
- **Type**: `CNAME`
- **Host**: `www`
- **Answer**: `cname.vercel-dns.com`
- **TTL**: `600`
- Clique em **"Add"**

**Registro 2 - A para domínio raiz:**
- Clique em **"Add Record"**
- **Type**: `A`
- **Host**: deixe vazio ou digite `@`
- **Answer**: `76.76.21.21` (IP da Vercel)
- **TTL**: `600`
- Clique em **"Add"**

**Registro 3 - Outro A para domínio raiz (failover):**
- Clique em **"Add Record"**
- **Type**: `A`
- **Host**: deixe vazio ou digite `@`
- **Answer**: `76.76.21.142`
- **TTL**: `600`
- Clique em **"Add"**

✅ DNS configurado!

## Passo 6.3 - Adicionar domínio customizado na Vercel

1. Volte para o **dashboard da Vercel**
2. Clique no projeto **"qota-finance"**
3. Clique na aba **"Settings"** (menu superior)
4. No menu lateral, clique em **"Domains"**
5. No campo, digite: `qotastore.lol`
6. Clique em **"Add"**
7. A Vercel vai verificar o DNS (pode levar alguns minutos)
8. Adicione também o `www`:
   - Digite: `www.qotastore.lol`
   - Clique em **"Add"**
9. Configure redirecionamento:
   - Em `www.qotastore.lol`, clique em **"Edit"**
   - Marque **"Redirect to qotastore.lol"**
   - Salve

## Passo 6.4 - Aguardar propagação DNS

⏰ **ISSO PODE LEVAR ATÉ 24 HORAS**, mas geralmente demora 15-30 minutos.

Para verificar:
1. Abra o navegador em modo anônimo
2. Tente acessar: `https://qotastore.lol`
3. Se não funcionar, aguarde mais um pouco ☕

Enquanto isso, você pode usar: `https://qota-finance.vercel.app`

---

# PARTE 7: TESTES FINAIS (10 minutos)

## Checklist de testes:

- [ ] Backend funcionando: `https://qota-finance-api.onrender.com/health`
- [ ] Frontend Vercel: `https://qota-finance.vercel.app`
- [ ] Domínio customizado: `https://qotastore.lol`
- [ ] Frontend consegue se comunicar com backend (testa as funcionalidades)
- [ ] Banco de dados salvando informações

## Se algo não funcionar:

### Problema: "CORS error" no console do navegador

**Solução**:
1. Vá no Render > qota-finance-api > Environment
2. Verifique se ALLOWED_ORIGINS tem TODAS as URLs:
   ```
   https://qotastore.lol,https://www.qotastore.lol,https://qota-finance.vercel.app
   ```
3. Salve e aguarde reiniciar

### Problema: Backend não inicia / erro no Render

**Solução**:
1. Vá em Render > qota-finance-api > Logs
2. Verifique os erros
3. Geralmente é problema de variável de ambiente
4. Confira se DATABASE_URL está correta

### Problema: Frontend com tela branca

**Solução**:
1. Abra o console do navegador (F12)
2. Veja os erros
3. Verifique se a URL da API está correta em `environment.prod.ts`

### Problema: Domínio não funciona

**Solução**:
1. Aguarde mais tempo (até 24h)
2. Verifique DNS em: https://dnschecker.org/
   - Digite: `qotastore.lol`
   - Veja se os registros A e CNAME aparecem
3. Se após 24h não funcionar, confira os registros DNS no Porkbun

---

# 🎉 PARABÉNS!

Seu sistema está no ar!

## URLs finais:

- **Site**: https://qotastore.lol
- **API**: https://qota-finance-api.onrender.com
- **Banco**: Gerenciado pelo Render

## 📊 Monitoramento:

- **Render**: https://dashboard.render.com - para ver logs do backend e banco
- **Vercel**: https://vercel.com/dashboard - para ver logs do frontend

## ⚠️ AVISOS IMPORTANTES:

### Plano Gratuito do Render:
- Após **15 minutos de inatividade**, o servidor "hiberna" (dorme)
- Na próxima visita, pode demorar **30-60 segundos** para "acordar"
- Se quiser evitar isso, faça upgrade para plano pago ($7/mês)

### Plano Gratuito da Vercel:
- Sem limitações significativas para sites pequenos
- Até 100GB de bandwidth por mês

### Banco de dados gratuito do Render:
- **90 dias de duração**
- Depois precisa migrar para plano pago ($7/mês) ou outro serviço
- **Alternativa gratuita permanente**: Neon.tech (https://neon.tech) - 0.5GB grátis para sempre

---

## 🔄 ATUALIZAÇÕES FUTURAS

Quando você alterar o código:

### Backend:
```bash
git add .
git commit -m "Descrição da alteração"
git push
```
O Render detecta automaticamente e faz re-deploy!

### Frontend:
```bash
git add .
git commit -m "Descrição da alteração"
git push
```
A Vercel detecta automaticamente e faz re-deploy!

---

## 🆘 PRECISA DE AJUDA?

- **Render Docs**: https://render.com/docs
- **Vercel Docs**: https://vercel.com/docs
- **Porkbun Support**: https://porkbun.com/support

---

**Boa sorte! 🚀**
