import { query } from '../config/database';
import { Gasto, CreateGastoDto, UpdateGastoDto } from '../models/gasto.model';

export class GastosService {
  async findAll(month?: string): Promise<Gasto[]> {
    let sql = 'SELECT * FROM gastos';
    const params: any[] = [];

    if (month) {
      sql += ` WHERE to_char(data, 'YYYY-MM') = $1`;
      params.push(month);
    }

    sql += ' ORDER BY data DESC, id DESC';

    const result = await query(sql, params);
    return result.rows;
  }

  async findById(id: number): Promise<Gasto | null> {
    const result = await query('SELECT * FROM gastos WHERE id = $1', [id]);
    return result.rows[0] || null;
  }

  async create(data: CreateGastoDto): Promise<Gasto> {
    const valor_usd = data.valor_usd || 0;
    const valor_brl = data.valor_brl || 0;
    const valor_eur = data.valor_eur || 0;

    const sql = `
      INSERT INTO gastos (data, categoria, descricao, valor_usd, valor_brl, valor_eur, metodo, conta, quem)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;

    const params = [
      data.data,
      data.categoria,
      data.descricao || '',
      valor_usd,
      valor_brl,
      valor_eur,
      data.metodo || '',
      data.conta || '',
      data.quem || ''
    ];

    const result = await query(sql, params);
    return result.rows[0];
  }

  async update(id: number, data: UpdateGastoDto): Promise<Gasto | null> {
    const existing = await this.findById(id);
    if (!existing) return null;

    const valor_usd = data.valor_usd !== undefined ? data.valor_usd : existing.valor_usd;
    const valor_brl = data.valor_brl !== undefined ? data.valor_brl : existing.valor_brl;
    const valor_eur = data.valor_eur !== undefined ? data.valor_eur : existing.valor_eur;

    const sql = `
      UPDATE gastos
      SET data = $1, categoria = $2, descricao = $3, valor_usd = $4, valor_brl = $5, valor_eur = $6,
          metodo = $7, conta = $8, quem = $9
      WHERE id = $10
      RETURNING *
    `;

    const params = [
      data.data || existing.data,
      data.categoria || existing.categoria,
      data.descricao !== undefined ? data.descricao : existing.descricao,
      valor_usd,
      valor_brl,
      valor_eur,
      data.metodo !== undefined ? data.metodo : existing.metodo,
      data.conta !== undefined ? data.conta : existing.conta,
      data.quem !== undefined ? data.quem : existing.quem,
      id
    ];

    const result = await query(sql, params);
    return result.rows[0];
  }

  async delete(id: number): Promise<boolean> {
    const result = await query('DELETE FROM gastos WHERE id = $1', [id]);
    return (result.rowCount ?? 0) > 0;
  }

  async getSummary(month: string): Promise<{
    total_usd: number;
    total_brl: number;
    total_eur: number;
  }> {
    const sql = `
      SELECT
        COALESCE(SUM(valor_usd), 0) as total_usd,
        COALESCE(SUM(valor_brl), 0) as total_brl,
        COALESCE(SUM(valor_eur), 0) as total_eur
      FROM gastos
      WHERE to_char(data, 'YYYY-MM') = $1
    `;

    const result = await query(sql, [month]);
    return result.rows[0];
  }
}

export const gastosService = new GastosService();
