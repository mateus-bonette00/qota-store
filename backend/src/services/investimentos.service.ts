import { query } from '../config/database';

/**
 * Ajuste o nome da tabela aqui caso seja diferente.
 */
const TABLE = 'investimentos';

/**
 * Filtros aceitos em list/summary.
 * - mes: 'YYYY-MM'
 * - from/to: 'YYYY-MM-DD'
 */
export interface InvestListFilters {
  mes?: string;
  from?: string;
  to?: string;
}

/**
 * Service genérico para a tabela de investimentos.
 * - create/update recebem objetos dinâmicos (Record<string, any>) e só persistem chaves definidas.
 * - id e created_at são ignorados no update para evitar bugs.
 */
export class InvestimentosService {
  /**
   * Lista investimentos com filtros por mês (YYYY-MM) ou intervalo de data (from/to).
   */
  async list(filters?: InvestListFilters): Promise<any[]> {
    let sql = `SELECT * FROM ${TABLE} WHERE 1=1`;
    const params: any[] = [];
    let i = 1;

    if (filters?.mes) {
      sql += ` AND TO_CHAR(data, 'YYYY-MM') = $${i++}`;
      params.push(filters.mes);
    }
    if (filters?.from) {
      sql += ` AND data >= $${i++}`;
      params.push(filters.from);
    }
    if (filters?.to) {
      sql += ` AND data <= $${i++}`;
      params.push(filters.to);
    }

    sql += ` ORDER BY data DESC, created_at DESC`;

    const result = await query(sql, params);
    return result.rows;
  }

  /**
   * Busca um investimento por id.
   */
  async findById(id: number): Promise<any | null> {
    const result = await query(`SELECT * FROM ${TABLE} WHERE id = $1`, [id]);
    return result.rows.length > 0 ? result.rows[0] : null;
  }

  /**
   * Cria um investimento com INSERT dinâmico.
   * Exemplo de body aceito:
   * {
   *   data: '2025-01-10',
   *   ativo: 'AMZN',
   *   tipo: 'COMPRA',
   *   quantidade: 10,
   *   preco: 180.50,
   *   corretora: 'XP',
   *   // ...outras colunas existentes na sua tabela
   * }
   */
  async create(data: Record<string, any>): Promise<any> {
    if (!data || typeof data !== 'object') {
      throw new Error('Payload inválido para criar investimento');
    }

    // filtramos chaves undefined e id/created_at
    const entries = Object.entries(data).filter(
      ([k, v]) => v !== undefined && k !== 'id' && k !== 'created_at'
    );

    if (entries.length === 0) {
      throw new Error('Nenhum campo válido informado para criação');
    }

    const cols = entries.map(([k]) => k);
    const vals = entries.map(([, v]) => v);
    const placeholders = cols.map((_, idx) => `$${idx + 1}`);

    const sql = `
      INSERT INTO ${TABLE} (${cols.join(', ')})
      VALUES (${placeholders.join(', ')})
      RETURNING *
    `;

    const result = await query(sql, vals);
    return result.rows[0];
  }

  /**
   * Atualiza um investimento por id com UPDATE dinâmico.
   * Ignora chaves: id, created_at.
   */
  async update(id: number, data: Record<string, any>): Promise<any | null> {
    const existing = await this.findById(id);
    if (!existing) return null;

    const entries = Object.entries(data).filter(
      ([k, v]) => v !== undefined && k !== 'id' && k !== 'created_at'
    );

    if (entries.length === 0) {
      // nada para atualizar; devolve o registro atual
      return existing;
    }

    const sets: string[] = [];
    const params: any[] = [];
    let i = 1;

    for (const [key, value] of entries) {
      sets.push(`${key} = $${i++}`);
      params.push(value);
    }

    params.push(id);
    const sql = `
      UPDATE ${TABLE}
         SET ${sets.join(', ')}
       WHERE id = $${i}
       RETURNING *
    `;

    const result = await query(sql, params);
    return result.rows[0] ?? null;
  }

  /**
   * Deleta um investimento por id.
   */
  async delete(id: number): Promise<boolean> {
    const result = await query(`DELETE FROM ${TABLE} WHERE id = $1 RETURNING id`, [id]);
    return (result?.rowCount ?? 0) > 0;
  }

  /**
   * Summary simples (genérico).
   * Como o schema pode variar, retornamos pelo menos:
   * - total_registros
   * - periodo (mes/from/to ecoados)
   *
   * Se sua tabela tiver colunas numéricas padrão (ex.: valor, quantidade),
   * você pode estender aqui com SUM/AVG específicos.
   */
  async summary(filters?: InvestListFilters): Promise<{
    total_registros: number;
    periodo: { mes?: string; from?: string; to?: string };
  }> {
    let sql = `SELECT COUNT(*)::int AS total FROM ${TABLE} WHERE 1=1`;
    const params: any[] = [];
    let i = 1;

    if (filters?.mes) {
      sql += ` AND TO_CHAR(data, 'YYYY-MM') = $${i++}`;
      params.push(filters.mes);
    }
    if (filters?.from) {
      sql += ` AND data >= $${i++}`;
      params.push(filters.from);
    }
    if (filters?.to) {
      sql += ` AND data <= $${i++}`;
      params.push(filters.to);
    }

    const result = await query(sql, params);
    const total = result.rows?.[0]?.total ?? 0;

    return {
      total_registros: Number(total),
      periodo: { mes: filters?.mes, from: filters?.from, to: filters?.to },
    };
  }
}

export const investimentosService = new InvestimentosService();
