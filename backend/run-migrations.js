require('dotenv').config();
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

async function runMigrations() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  });

  try {
    await client.connect();
    console.log('✅ Conectado ao banco de dados');

    const migrationsDir = path.join(__dirname, 'src', 'database', 'migrations');
    const files = fs.readdirSync(migrationsDir).sort();

    console.log(`📁 Encontradas ${files.length} migrations`);

    for (const file of files) {
      if (file.endsWith('.sql')) {
        console.log(`🔄 Executando ${file}...`);
        const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
        await client.query(sql);
        console.log(`✅ ${file} executado com sucesso`);
      }
    }

    console.log('🎉 Todas as migrations foram executadas!');
  } catch (error) {
    console.error('❌ Erro ao executar migrations:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

runMigrations();
