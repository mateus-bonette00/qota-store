export type ProdutoStatus = 'sourcing' | 'comprado' | 'em_transito' | 'no_estoque' | 'vendido';

export interface Produto {
  id?: number;
  data_add: string; // YYYY-MM-DD format
  nome: string;
  sku?: string;
  upc?: string;
  asin?: string;

  // Kanban status
  status: ProdutoStatus;

  // Inventory
  estoque: number; // Current stock quantity
  quantidade: number; // Original purchase quantity

  // Category and supplier
  categoria?: string;
  fornecedor?: string;

  // Cost breakdown (all in original currency)
  custo_base: number; // Base cost per unit
  freight: number; // Freight/shipping per unit
  tax: number; // Tax per unit
  prep: number; // Prep fee per unit (default 2)

  // Multi-currency support
  moeda_compra: 'USD' | 'BRL' | 'EUR'; // Purchase currency
  valor_eur?: number; // Total value in EUR if applicable

  // Selling info
  sold_for: number; // Selling price on Amazon
  amazon_fees: number; // Amazon fees per unit (15% typically)

  // Links
  link_amazon?: string;
  link_fornecedor?: string;

  // Amazon listing date
  data_amz?: string; // Date when product went live on Amazon

  // Timestamps
  created_at?: string;
  updated_at?: string;
}

export interface ProdutoCreate extends Omit<Produto, 'id' | 'created_at' | 'updated_at'> {}

export interface ProdutoUpdate extends Partial<ProdutoCreate> {}

export interface ProdutoWithMetrics extends Produto {
  custo_total: number; // custo_base + freight + tax + prep
  lucro_unitario: number; // sold_for - amazon_fees - custo_total
  margem_percentual: number; // (lucro_unitario / sold_for) * 100
  valor_estoque_usd: number; // estoque * custo_total (converted to USD)
  valor_estoque_brl: number; // estoque * custo_total (converted to BRL)
  quantidade_vendida?: number; // From receitas table
  receita_total_usd?: number; // From receitas table
  lucro_total_usd?: number; // From receitas table
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

export interface ProdutoDashboard {
  total_produtos: number;
  total_estoque: number; // Total units
  valor_total_estoque_usd: number;
  valor_total_estoque_brl: number;
  margem_media: number;
  produtos_por_status: {
    [key in ProdutoStatus]: number;
  };
  top_produtos_vendidos: ProdutoWithMetrics[];
  top_produtos_margem: ProdutoWithMetrics[];
  alertas_estoque_baixo: ProdutoWithMetrics[];
}

export const PRODUTO_STATUS_LABELS: Record<ProdutoStatus, string> = {
  sourcing: 'Sourcing',
  comprado: 'Comprado',
  em_transito: 'Em Trânsito',
  no_estoque: 'No Estoque',
  vendido: 'Vendido'
};

export const PRODUTO_STATUS_COLORS: Record<ProdutoStatus, string> = {
  sourcing: '#9CA3AF', // Gray
  comprado: '#3B82F6', // Blue
  em_transito: '#F59E0B', // Orange
  no_estoque: '#10B981', // Green
  vendido: '#8B5CF6' // Purple
};
