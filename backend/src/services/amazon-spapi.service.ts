import axios from 'axios';
import { config } from '../config/env';

interface AmazonCredentials {
  refreshToken: string;
  clientId: string;
  clientSecret: string;
  region: 'na' | 'eu' | 'fe'; // North America / Europe / Far East
}

interface FinancialEvent {
  eventType: string;
  postedDate: string;
  amount: number;
  currency: string;
}

const REGION_ENDPOINT: Record<AmazonCredentials['region'], string> = {
  na: 'https://sellingpartnerapi-na.amazon.com',
  eu: 'https://sellingpartnerapi-eu.amazon.com',
  fe: 'https://sellingpartnerapi-fe.amazon.com',
};

export class AmazonSPAPIService {
  private accessToken: string | null = null;
  private tokenExpiry = 0; // epoch ms

  constructor(private credentials: AmazonCredentials) {}

  /**
   * Garante um access token válido (Login With Amazon) e retorna SEMPRE string.
   */
  private async getAccessToken(): Promise<string> {
    // reutiliza token válido (com 60s de folga)
    const cached = this.accessToken;
    if (cached && Date.now() < this.tokenExpiry - 60_000) {
      return cached; // aqui o TS sabe que é string
    }

    try {
      // LWA exige x-www-form-urlencoded
      const body = new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: this.credentials.refreshToken,
        client_id: this.credentials.clientId,
        client_secret: this.credentials.clientSecret,
      });

      const resp = await axios.post(
        'https://api.amazon.com/auth/o2/token',
        body,
        { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
      );

      const { access_token, expires_in } = resp.data as {
        access_token?: string;
        expires_in?: number;
      };

      if (!access_token) {
        throw new Error('Resposta LWA sem access_token');
      }

      this.accessToken = access_token;
      const ttlSec = Number(expires_in ?? 3600);
      this.tokenExpiry = Date.now() + ttlSec * 1000;

      return this.accessToken; // agora é string
    } catch (error: any) {
      console.error('Erro ao obter access token:', error?.response?.data || error?.message || error);
      throw new Error('Falha na autenticação com Amazon SP-API');
    }
  }

  /**
   * Buscar Saldo Disponível na Amazon (exemplo simplificado com Finances API)
   */
  async getAccountBalance(): Promise<{ disponivel: number; pendente: number; moeda: string }> {
    try {
      const token = await this.getAccessToken();
      const endpoint = REGION_ENDPOINT[this.credentials.region];
      const path = '/finances/v0/financialEvents';

      const response = await axios.get(`${endpoint}${path}`, {
        headers: {
          'x-amz-access-token': token,
          'Content-Type': 'application/json',
        },
        params: {
          // Últimos 30 dias
          PostedAfter: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        },
      });

      // Cálculo simples a partir de eventos (exemplo; ajuste conforme sua necessidade)
      let disponivel = 0;
      let pendente = 0;

      const events = response.data?.FinancialEvents || {};

      if (Array.isArray(events.ShipmentEventList)) {
        for (const event of events.ShipmentEventList) {
          for (const item of event.ShipmentItemList ?? []) {
            for (const charge of item.ItemChargeList ?? []) {
              disponivel += Number(charge?.ChargeAmount?.CurrencyAmount || 0);
            }
          }
        }
      }

      return {
        disponivel: Math.max(0, disponivel),
        pendente, // preencha se processar outros tipos de eventos
        moeda: 'USD',
      };
    } catch (error: any) {
      console.error('Erro ao buscar saldo Amazon:', error?.response?.data || error?.message || error);
      // fallback neutro
      return { disponivel: 0, pendente: 0, moeda: 'USD' };
    }
  }

  /**
   * Buscar Vendas Recentes (Orders)
   */
  async getRecentOrders(daysAgo: number = 7): Promise<any[]> {
    try {
      const token = await this.getAccessToken();
      const endpoint = REGION_ENDPOINT[this.credentials.region];
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
        },
      });

      return response.data?.Orders ?? [];
    } catch (error: any) {
      console.error('Erro ao buscar pedidos Amazon:', error?.response?.data || error?.message || error);
      return [];
    }
  }

  /**
   * Buscar Itens de um Pedido
   */
  async getOrderItems(orderId: string): Promise<any[]> {
    try {
      const token = await this.getAccessToken();
      const endpoint = REGION_ENDPOINT[this.credentials.region];
      const path = `/orders/v0/orders/${orderId}/orderItems`;

      const response = await axios.get(`${endpoint}${path}`, {
        headers: {
          'x-amz-access-token': token,
          'Content-Type': 'application/json',
        },
      });

      return response.data?.OrderItems ?? [];
    } catch (error: any) {
      console.error('Erro ao buscar itens do pedido:', error?.response?.data || error?.message || error);
      return [];
    }
  }

  /**
   * Buscar Inventário FBA (Fulfillment Inventory)
   * Retorna lista de produtos no inventário da Amazon
   */
  async getFBAInventory(): Promise<any[]> {
    try {
      const token = await this.getAccessToken();
      const endpoint = REGION_ENDPOINT[this.credentials.region];
      const path = '/fba/inventory/v1/summaries';

      const response = await axios.get(`${endpoint}${path}`, {
        headers: {
          'x-amz-access-token': token,
          'Content-Type': 'application/json',
        },
        params: {
          granularityType: 'Marketplace',
          granularityId: 'ATVPDKIKX0DER', // US marketplace
          marketplaceIds: 'ATVPDKIKX0DER',
        },
      });

      return response.data?.payload?.inventorySummaries ?? [];
    } catch (error: any) {
      console.error('Erro ao buscar inventário FBA:', error?.response?.data || error?.message || error);
      return [];
    }
  }

  /**
   * Buscar detalhes de um produto pelo SKU
   */
  async getProductBySKU(sku: string): Promise<any | null> {
    try {
      const token = await this.getAccessToken();
      const endpoint = REGION_ENDPOINT[this.credentials.region];
      const path = '/catalog/2022-04-01/items';

      const response = await axios.get(`${endpoint}${path}`, {
        headers: {
          'x-amz-access-token': token,
          'Content-Type': 'application/json',
        },
        params: {
          marketplaceIds: 'ATVPDKIKX0DER',
          identifiers: sku,
          identifiersType: 'SKU',
        },
      });

      const items = response.data?.items ?? [];
      return items.length > 0 ? items[0] : null;
    } catch (error: any) {
      console.error(`Erro ao buscar produto SKU ${sku}:`, error?.response?.data || error?.message || error);
      return null;
    }
  }
}

// Singleton
export const amazonService = new AmazonSPAPIService({
  refreshToken: config.spapi.refreshToken,
  clientId: config.spapi.clientId,
  clientSecret: config.spapi.clientSecret,
  region: 'na', // North America
});
