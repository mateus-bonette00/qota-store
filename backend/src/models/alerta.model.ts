export type AlertaTipo =
  | 'gasto_alto'
  | 'estoque_baixo'
  | 'margem_baixa'
  | 'sync_error'
  | 'meta_atingida'
  | 'meta_nao_atingida'
  | 'produto_sem_venda'
  | 'cambio_favoravel'
  | 'cambio_desfavoravel';

export type AlertaSeveridade = 'info' | 'warning' | 'error' | 'success';

export interface Alerta {
  id?: number;
  tipo: AlertaTipo;
  titulo: string;
  mensagem: string;
  severidade: AlertaSeveridade;
  data?: string; // Timestamp
  lido: boolean;
  entidade_id?: number; // ID of related entity
  entidade_tipo?: string; // Type of entity: 'produto', 'gasto', 'receita', etc
  metadata?: any; // Additional data (JSON)
  created_at?: string;
}

export interface AlertaCreate extends Omit<Alerta, 'id' | 'data' | 'created_at'> {}

export interface AlertaUpdate {
  lido?: boolean;
}

export interface AlertaSummary {
  total: number;
  nao_lidos: number;
  por_severidade: {
    [key in AlertaSeveridade]: number;
  };
  por_tipo: {
    [key in AlertaTipo]?: number;
  };
}
