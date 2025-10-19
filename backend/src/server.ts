import app from './app';
import { config } from './config/env';
import { pool } from './config/database';

const PORT = config.port || 8000;

// Testar conexão com banco
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('❌ Erro ao conectar ao banco de dados:', err);
    process.exit(1);
  }
  console.log('✅ Conectado ao PostgreSQL:', res.rows[0].now);
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📍 Environment: ${config.nodeEnv}`);
  console.log(`🌐 API disponível em: http://localhost:${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('👋 SIGTERM recebido. Fechando servidor...');
  pool.end(() => {
    console.log('✅ Pool de conexões encerrado');
    process.exit(0);
  });
});