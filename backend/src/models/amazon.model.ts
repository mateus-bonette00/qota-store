export interface AmazonSaldo {
  id?: number;
  data: string; // YYYY-MM-DD format
  disponivel: number; // Available balance
  pendente: number; // Pending balance
  moeda: string; // Usually 'USD'
  created_at?: string;
}

export interface AmazonReceita {
  id?: number;
  data: string; // YYYY-MM-DD format
  produto_id?: number; // FK to produtos
  quantidade: number;
  valor_usd: number;
  quem?: string;
  obs?: string;
  produto?: string; // Product name
  sku?: string;
  created_at?: string;
  updated_at?: string;
}

export interface AmazonSettlement {
  id?: number;
  data: string; // YYYY-MM-DD format
  amount_usd: number;
  group_id?: string;
  description?: string;
  created_at?: string;
}

export interface AmazonSyncLog {
  id?: number;
  data?: string; // Timestamp
  tipo: 'orders' | 'balance' | 'settlement' | 'products'; // Sync type
  registros_novos: number; // New records created
  registros_atualizados: number; // Records updated
  status: 'success' | 'error' | 'partial'; // Sync status
  erro?: string; // Error message if failed
  detalhes?: any; // Additional details (JSON)
  created_at?: string;
}

export interface AmazonOrder {
  orderId: string;
  purchaseDate: string;
  orderStatus: string;
  orderTotal?: {
    currencyCode: string;
    amount: string;
  };
  numberOfItemsShipped: number;
  numberOfItemsUnshipped: number;
  marketplaceId: string;
  items?: AmazonOrderItem[];
}

export interface AmazonOrderItem {
  orderItemId: string;
  sku: string;
  asin: string;
  title: string;
  quantityOrdered: number;
  quantityShipped: number;
  itemPrice?: {
    currencyCode: string;
    amount: string;
  };
  itemTax?: {
    currencyCode: string;
    amount: string;
  };
}

export interface AmazonFinancialEvent {
  eventType: string;
  postedDate: string;
  orderId?: string;
  marketplaceName?: string;
  charges?: {
    chargeType: string;
    amount: number;
  }[];
  fees?: {
    feeType: string;
    amount: number;
  }[];
}

export interface AmazonSyncResult {
  success: boolean;
  tipo: string;
  registros_novos: number;
  registros_atualizados: number;
  erro?: string;
  detalhes?: any;
}
