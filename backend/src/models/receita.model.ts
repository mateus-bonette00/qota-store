export interface Receita {
  id?: number;
  data: string; // YYYY-MM-DD format
  origem: string; // 'FBA', 'FBM', 'Wholesale', 'Other'
  descricao?: string;

  // Multi-currency support
  valor: number; // Original amount
  moeda: 'USD' | 'BRL' | 'EUR'; // Original currency
  valor_brl: number; // Converted to BRL
  valor_usd: number; // Converted to USD
  valor_eur: number; // Converted to EUR

  // Payment details
  metodo?: string; // Pix, Cartão, Transferência, PayPal, etc
  conta?: string; // Nubank, Nomad, Wise, Mercury Bank, etc
  quem?: string; // Person who registered

  // FBA Financial breakdown
  bruto: number; // Gross revenue (sold_for * quantidade)
  cogs: number; // Cost of Goods Sold
  taxas_amz: number; // Amazon fees (referral fee, FBA fee, etc)
  ads: number; // Advertising spend
  frete: number; // Shipping costs
  descontos: number; // Discounts/promotions
  lucro: number; // Net profit (bruto - cogs - taxas_amz - ads - frete - descontos)

  // Product reference
  produto_id?: number; // FK to produtos table
  sku?: string;
  asin?: string;
  quantidade: number;

  // Timestamps
  created_at?: string;
  updated_at?: string;
}

export interface ReceitaCreate extends Omit<Receita, 'id' | 'created_at' | 'updated_at'> {}

export interface ReceitaUpdate extends Partial<ReceitaCreate> {}

export interface ReceitaSummary {
  total_bruto_usd: number;
  total_bruto_brl: number;
  total_cogs_usd: number;
  total_cogs_brl: number;
  total_taxas_amz_usd: number;
  total_taxas_amz_brl: number;
  total_ads_usd: number;
  total_ads_brl: number;
  total_lucro_usd: number;
  total_lucro_brl: number;
  quantidade_vendas: number;
  ticket_medio_usd: number;
  ticket_medio_brl: number;
  margem_media: number; // Percentage
}

export interface ReceitasPorProduto {
  produto_id: number;
  produto_nome: string;
  sku: string;
  asin: string;
  quantidade_total: number;
  receita_total_usd: number;
  receita_total_brl: number;
  lucro_total_usd: number;
  lucro_total_brl: number;
  margem_media: number;
}
