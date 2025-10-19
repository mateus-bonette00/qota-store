import axios from 'axios';
import crypto from 'crypto';
import { config } from '../config/env';

interface AmazonCredentials {
  refreshToken: string;
  clientId: string;
  clientSecret: string;
  region: string;
}

interface FinancialEvent {
  eventType: string;
  postedDate: string;
  amount: number;
  currency: string;
}

export class AmazonSPAPIService {
  private accessToken: string | null = null;
  private tokenExpiry: number = 0;

  constructor(private credentials: AmazonCredentials) {}

  /**
   * Obter Access Token da Amazon LWA (Login with Amazon)
   */
  private async getAccessToken(): Promise<string> {
    // Se token ainda válido, retorna
    if (this.accessToken && Date.now() < this.tokenExpiry) {
      return this.accessToken;
    }

    try {
      const response = await axios.post('https://api.amazon.com/auth/o2/token', {
        grant_type: 'refresh_token',
        refresh_token: this.credentials.refreshToken,
        client_id: this.credentials.clientId,
        client_secret: this.credentials.clientSecret,
      });

      this.accessToken = response.data.access_token;
      this.tokenExpiry = Date.now() + (response.data.expires_in * 1000) - 60000; // -1min de margem

      return this.accessToken;
    } catch (error: any) {
      console.error('Erro ao obter access token:', error.response?.data || error.message);
      throw new Error('Falha na autenticação com Amazon SP-API');
    }
  }

  /**
   * Buscar Saldo Disponível na Amazon
   */
  async getAccountBalance(): Promise<{ disponivel: number; pendente: number; moeda: string }> {
    try {
      const token = await this.getAccessToken();
      const endpoint = `https://sellingpartnerapi-na.amazon.com`;
      const path = '/finances/v0/financialEvents';

      const response = await axios.get(`${endpoint}${path}`, {
        headers: {
          'x-amz-access-token': token,
          'Content-Type': 'application/json',
        },
        params: {
          PostedAfter: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // Últimos 30 dias
        }
      });

      // Calcular saldo baseado em eventos financeiros
      let disponivel = 0;
      let pendente = 0;

      const events = response.data.FinancialEvents || {};
      
      // Processar diferentes tipos de eventos
      if (events.ShipmentEventList) {
        events.ShipmentEventList.forEach((event: any) => {
          event.ShipmentItemList?.forEach((item: any) => {
            item.ItemChargeList?.forEach((charge: any) => {
              disponivel += Number(charge.ChargeAmount?.CurrencyAmount || 0);
            });
          });
        });
      }

      return {
        disponivel: Math.max(0, disponivel),
        pendente,
        moeda: 'USD'
      };

    } catch (error: any) {
      console.error('Erro ao buscar saldo Amazon:', error.response?.data || error.message);
      
      // Retornar valores do banco como fallback
      return {
        disponivel: 0,
        pendente: 0,
        moeda: 'USD'
      };
    }
  }

  /**
   * Buscar Vendas Recentes (Orders)
   */
  async getRecentOrders(daysAgo: number = 7): Promise<any[]> {
    try {
      const token = await this.getAccessToken();
      const endpoint = `https://sellingpartnerapi-na.amazon.com`;
      const path = '/orders/v0/orders';

      const createdAfter = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toISOString();

      const response = await axios.get(`${endpoint}${path}`, {
        headers: {
          'x-amz-access-token': token,
          'Content-Type': 'application/json',
        },
        params: {
          MarketplaceIds: 'ATVPDKIKX0DER', // US marketplace
          CreatedAfter: createdAfter,
          OrderStatuses: 'Shipped,Unshipped',
        }
      });

      return response.data.Orders || [];

    } catch (error: any) {
      console.error('Erro ao buscar pedidos Amazon:', error.response?.data || error.message);
      return [];
    }
  }

  /**
   * Buscar Detalhes de um Pedido Específico
   */
  async getOrderItems(orderId: string): Promise<any[]> {
    try {
      const token = await this.getAccessToken();
      const endpoint = `https://sellingpartnerapi-na.amazon.com`;
      const path = `/orders/v0/orders/${orderId}/orderItems`;

      const response = await axios.get(`${endpoint}${path}`, {
        headers: {
          'x-amz-access-token': token,
          'Content-Type': 'application/json',
        }
      });

      return response.data.OrderItems || [];

    } catch (error: any) {
      console.error('Erro ao buscar itens do pedido:', error.response?.data || error.message);
      return [];
    }
  }
}

// Singleton instance
export const amazonService = new AmazonSPAPIService({
  refreshToken: config.spapi.refreshToken,
  clientId: config.spapi.clientId,
  clientSecret: config.spapi.clientSecret,
  region: 'na' // North America
});