import { Pool } from 'pg';
import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';
import { config } from '../config/env';

export async function runMigrations(): Promise<void> {
  const pool = new Pool({
    connectionString: config.databaseUrl,
    ssl: config.nodeEnv === 'production' ? { rejectUnauthorized: false } : undefined
  });

  try {
    console.log('🔄 Executando migrations do banco de dados...');

    const client = await pool.connect();

    try {
      // Criar tabela de controle de migrations se não existir
      await client.query(`
        CREATE TABLE IF NOT EXISTS migrations (
          id SERIAL PRIMARY KEY,
          filename VARCHAR(255) NOT NULL UNIQUE,
          executed_at TIMESTAMP DEFAULT NOW()
        );
      `);

      const migrationsDir = join(__dirname, 'migrations');
      const files = readdirSync(migrationsDir)
        .filter(f => f.endsWith('.sql'))
        .sort();

      console.log(`📁 Encontradas ${files.length} migrations`);

      for (const file of files) {
        // Verificar se já foi executada
        const result = await client.query(
          'SELECT * FROM migrations WHERE filename = $1',
          [file]
        );

        if (result.rows.length > 0) {
          console.log(`⏭️  ${file} - já executada, pulando...`);
          continue;
        }

        // Executar migration
        console.log(`🔄 Executando ${file}...`);
        const sql = readFileSync(join(migrationsDir, file), 'utf8');

        await client.query('BEGIN');
        try {
          await client.query(sql);
          await client.query(
            'INSERT INTO migrations (filename) VALUES ($1)',
            [file]
          );
          await client.query('COMMIT');
          console.log(`✅ ${file} - executada com sucesso!`);
        } catch (err) {
          await client.query('ROLLBACK');
          throw err;
        }
      }

      console.log('🎉 Todas as migrations foram executadas!\n');
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('❌ Erro ao executar migrations:', error);
    throw error;
  } finally {
    await pool.end();
  }
}
