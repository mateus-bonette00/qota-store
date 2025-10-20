export interface Gasto {
  id: number;
  data: string;
  categoria: string;
  descricao?: string;
  valor_usd: number;       // valor em USD
  valor_brl: number;       // valor em BRL
  valor_eur: number;       // valor em EUR
  metodo?: string;
  conta?: string;
  quem?: string;
}

export interface CreateGastoDto {
  data: string;
  categoria: string;
  descricao?: string;
  valor_usd: number;
  valor_brl: number;
  valor_eur: number;
  metodo?: string;
  conta?: string;
  quem?: string;
}

export interface UpdateGastoDto {
  data?: string;
  categoria?: string;
  descricao?: string;
  valor_usd?: number;
  valor_brl?: number;
  valor_eur?: number;
  metodo?: string;
  conta?: string;
  quem?: string;
}

export const CATEGORIAS_GASTO = [
  'Compra de Produto',
  'Mensalidade/Assinatura',
  'Contabilidade/Legal',
  'Taxas/Impostos',
  'Frete/Logística',
  'Outros'
] as const;

export const METODOS_PAGAMENTO = [
  'Pix',
  'Cartão de Crédito',
  'Boleto',
  'Transferência',
  'Dinheiro',
  'PayPal',
  'Wise'
] as const;

export const CONTAS = [
  'Nubank',
  'Nomad',
  'Wise',
  'Mercury Bank',
  'WesternUnion',
  'PayPal'
] as const;

export const MOEDAS = ['BRL', 'USD', 'EUR'] as const;