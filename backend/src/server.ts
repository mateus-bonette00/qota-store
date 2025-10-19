import 'dotenv/config';
import app from './app';
import { createServer } from 'http';
import { startCronJobs } from './jobs';
import { initWebSocket } from './websocket';

const PORT = process.env.PORT || 8000;

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