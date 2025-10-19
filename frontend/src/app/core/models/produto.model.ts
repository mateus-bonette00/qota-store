export type ProdutoStatus = 'sourcing' | 'comprado' | 'em_transito' | 'no_estoque' | 'vendido';

export interface Produto {
  id?: number;
  data_add: string;
  nome: string;
  sku?: string;
  upc?: string;
  asin?: string;
  status: ProdutoStatus;
  estoque: number;
  quantidade: number;
  categoria?: string;
  fornecedor?: string;
  custo_base: number;
  freight: number;
  tax: number;
  prep: number;
  moeda_compra: 'USD' | 'BRL' | 'EUR';
  valor_eur?: number;
  sold_for: number;
  amazon_fees: number;
  link_amazon?: string;
  link_fornecedor?: string;
  data_amz?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ProdutoWithMetrics extends Produto {
  custo_total: number;
  lucro_unitario: number;
  margem_percentual: number;
  valor_estoque_usd: number;
  valor_estoque_brl: number;
  quantidade_vendida?: number;
  receita_total_usd?: number;
  lucro_total_usd?: number;
}

export interface ProdutoKanbanColumn {
  status: ProdutoStatus;
  label: string;
  produtos: ProdutoWithMetrics[];
  total_produtos: number;
  total_unidades: number;
  valor_total_usd: number;
  valor_total_brl: number;
}
