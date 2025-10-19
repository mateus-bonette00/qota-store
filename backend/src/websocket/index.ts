import { Server as HTTPServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { amazonSPAPIService } from '../services/amazon-spapi.service';

export class WebSocketService {
  private io: SocketIOServer;

  constructor(httpServer: HTTPServer) {
    this.io = new SocketIOServer(httpServer, {
      cors: {
        origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:4200'],
        methods: ['GET', 'POST']
      }
    });

    this.setupHandlers();
  }

  private setupHandlers() {
    this.io.on('connection', (socket) => {
      console.log(`[WebSocket] Cliente conectado: ${socket.id}`);

      // Cliente solicita atualização de saldo Amazon
      socket.on('request:amazon-balance', async () => {
        try {
          const balance = await amazonSPAPIService.getAccountBalance();
          socket.emit('update:amazon-balance', balance);
        } catch (error) {
          socket.emit('error:amazon-balance', { message: 'Erro ao buscar saldo' });
        }
      });

      // Cliente solicita atualização de taxas de câmbio
      socket.on('request:exchange-rates', async () => {
        try {
          const { currencyService } = await import('../services/currency.service');
          const rates = await currencyService.getExchangeRates();
          socket.emit('update:exchange-rates', rates);
        } catch (error) {
          socket.emit('error:exchange-rates', { message: 'Erro ao buscar taxas' });
        }
      });

      socket.on('disconnect', () => {
        console.log(`[WebSocket] Cliente desconectado: ${socket.id}`);
      });
    });
  }

  /**
   * Broadcast para todos os clientes
   */
  broadcast(event: string, data: any) {
    this.io.emit(event, data);
  }

  /**
   * Enviar atualização de saldo Amazon para todos
   */
  async broadcastAmazonBalance() {
    try {
      const balance = await amazonSPAPIService.getAccountBalance();
      this.broadcast('update:amazon-balance', balance);
    } catch (error) {
      console.error('[WebSocket] Erro ao broadcast de saldo Amazon:', error);
    }
  }
}

export let websocketService: WebSocketService;

export function initWebSocket(httpServer: HTTPServer) {
  websocketService = new WebSocketService(httpServer);
  console.log('✅ WebSocket iniciado com sucesso!');
  return websocketService;
}