import 'dotenv/config';
import app from './app';
import { createServer } from 'http';
import { startCronJobs } from './jobs';
import { initWebSocket } from './websocket';
import { runMigrations } from './database/run-migrations';

const PORT = process.env.PORT || 8000;

async function startServer() {
  try {
    // Executar migrations primeiro (desabilitado - rode manualmente com: npm run migrate)
    // await runMigrations();

    // Criar servidor HTTP
    const httpServer = createServer(app);

    // Inicializar WebSocket
    initWebSocket(httpServer);

    // Iniciar Cron Jobs
    startCronJobs();

    // Iniciar servidor
    httpServer.listen(PORT, () => {
      console.log(`\n🚀 Servidor rodando na porta ${PORT}`);
      console.log(`📡 WebSocket habilitado`);
      console.log(`🕐 Cron Jobs ativos\n`);
    });
  } catch (error) {
    console.error('❌ Erro ao iniciar servidor:', error);
    process.exit(1);
  }
}

startServer();