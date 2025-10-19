import { query } from '../config/database';
import { Gasto, CreateGastoDto, UpdateGastoDto } from '../models/gasto.model';
import { currencyService } from './currency.service';

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
    const moeda = data.moeda || 'BRL';
    const valor = data.valor || 0;

    // Converter para BRL e USD
    const valor_brl = moeda === 'BRL' 
      ? valor 
      : await currencyService.convert(valor, moeda as any, 'BRL');

    const valor_usd = moeda === 'USD'
      ? valor
      : await currencyService.convert(valor, moeda as any, 'USD');

    const sql = `
      INSERT INTO gastos (data, categoria, descricao, valor, moeda, valor_brl, valor_usd, metodo, conta, quem)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `;

    const params = [
      data.data,
      data.categoria,
      data.descricao || '',
      valor,
      moeda,
      valor_brl,
      valor_usd,
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

    const moeda = data.moeda || existing.moeda;
    const valor = data.valor !== undefined ? data.valor : existing.valor;

    // Recalcular conversões se valor ou moeda mudou
    const valor_brl = moeda === 'BRL'
      ? valor
      : await currencyService.convert(valor, moeda as any, 'BRL');

    const valor_usd = moeda === 'USD'
      ? valor
      : await currencyService.convert(valor, moeda as any, 'USD');

    const sql = `
      UPDATE gastos
      SET data = $1, categoria = $2, descricao = $3, valor = $4, moeda = $5,
          valor_brl = $6, valor_usd = $7, metodo = $8, conta = $9, quem = $10
      WHERE id = $11
      RETURNING *
    `;

    const params = [
      data.data ?? existing.data,
      data.categoria ?? existing.categoria,
      data.descricao ?? existing.descricao,
      valor,
      moeda,
      valor_brl,
      valor_usd,
      data.metodo ?? existing.metodo,
      data.conta ?? existing.conta,
      data.quem ?? existing.quem,
      id
    ];

    const result = await query(sql, params);
    return result.rows[0];
  }

  async delete(id: number): Promise<boolean> {
    const result = await query('DELETE FROM gastos WHERE id = $1', [id]);
    return (result.rowCount ?? 0) > 0;
  }

  async getTotalByMonth(month: string): Promise<{ total_brl: number; total_usd: number }> {
    const sql = `
      SELECT 
        COALESCE(SUM(valor_brl), 0) as total_brl,
        COALESCE(SUM(valor_usd), 0) as total_usd
      FROM gastos
      WHERE to_char(data, 'YYYY-MM') = $1
    `;

    const result = await query(sql, [month]);
    return result.rows[0];
  }
}