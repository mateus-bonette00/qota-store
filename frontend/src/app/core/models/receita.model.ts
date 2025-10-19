export interface Receita {
  id?: number;
  data: string;
  origem: string;
  descricao?: string;
  valor: number;
  moeda: 'USD' | 'BRL' | 'EUR';
  valor_brl: number;
  valor_usd: number;
  valor_eur: number;
  metodo?: string;
  conta?: string;
  quem?: string;
  bruto: number;
  cogs: number;
  taxas_amz: number;
  ads: number;
  frete: number;
  descontos: number;
  lucro: number;
  produto_id?: number;
  sku?: string;
  asin?: string;
  quantidade: number;
  created_at?: string;
  updated_at?: string;
}

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
  margem_media: number;
}
