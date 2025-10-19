export interface Investimento {
  id?: number;
  data: string; // YYYY-MM-DD format
  tipo: string; // 'capital', 'emprestimo', 'lucro_reinvestido', etc

  // Multi-currency support
  valor: number; // Original amount
  moeda: 'USD' | 'BRL' | 'EUR'; // Original currency
  valor_brl: number; // Converted to BRL
  valor_usd: number; // Converted to USD
  valor_eur: number; // Converted to EUR

  // Payment details
  metodo?: string; // Pix, Cartão, Transferência, Wire, etc
  conta?: string; // Nubank, Nomad, Wise, Mercury Bank, etc
  quem?: string; // Person who invested

  descricao?: string; // Description of investment

  // Timestamps
  created_at?: string;
  updated_at?: string;
}

export interface InvestimentoCreate extends Omit<Investimento, 'id' | 'created_at' | 'updated_at'> {}

export interface InvestimentoUpdate extends Partial<InvestimentoCreate> {}

export interface InvestimentoSummary {
  total_investido_usd: number;
  total_investido_brl: number;
  total_investido_eur: number;
  investimentos_por_tipo: {
    tipo: string;
    total_usd: number;
    total_brl: number;
    quantidade: number;
  }[];
  timeline: {
    data: string;
    valor_usd: number;
    valor_brl: number;
    acumulado_usd: number;
    acumulado_brl: number;
  }[];
}
