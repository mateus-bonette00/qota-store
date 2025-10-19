import pool from '../database/database';
import { SistemaExterno } from '../models/sistema-externo.model';

export class SistemasExternosService {
  async getAll(): Promise<SistemaExterno[]> {
    const result = await pool.query(
      'SELECT * FROM sistemas_externos ORDER BY nome_sistema ASC'
    );
    return result.rows;
  }

  async getById(id: number): Promise<SistemaExterno | null> {
    const result = await pool.query(
      'SELECT * FROM sistemas_externos WHERE id = $1',
      [id]
    );
    return result.rows[0] || null;
  }

  async create(sistema: Omit<SistemaExterno, 'id' | 'created_at' | 'updated_at'>): Promise<SistemaExterno> {
    const { nome_sistema, url, usuario_email, senha, observacoes } = sistema;

    const result = await pool.query(
      `INSERT INTO sistemas_externos (nome_sistema, url, usuario_email, senha, observacoes)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [nome_sistema, url || null, usuario_email || null, senha || null, observacoes || null]
    );

    return result.rows[0];
  }

  async update(id: number, sistema: Partial<SistemaExterno>): Promise<SistemaExterno | null> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (sistema.nome_sistema !== undefined) {
      fields.push(`nome_sistema = $${paramIndex++}`);
      values.push(sistema.nome_sistema);
    }
    if (sistema.url !== undefined) {
      fields.push(`url = $${paramIndex++}`);
      values.push(sistema.url);
    }
    if (sistema.usuario_email !== undefined) {
      fields.push(`usuario_email = $${paramIndex++}`);
      values.push(sistema.usuario_email);
    }
    if (sistema.senha !== undefined) {
      fields.push(`senha = $${paramIndex++}`);
      values.push(sistema.senha);
    }
    if (sistema.observacoes !== undefined) {
      fields.push(`observacoes = $${paramIndex++}`);
      values.push(sistema.observacoes);
    }

    if (fields.length === 0) {
      return this.getById(id);
    }

    values.push(id);
    const query = `UPDATE sistemas_externos SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`;
    const result = await pool.query(query, values);

    return result.rows[0] || null;
  }

  async delete(id: number): Promise<boolean> {
    const result = await pool.query(
      'DELETE FROM sistemas_externos WHERE id = $1',
      [id]
    );
    return (result.rowCount ?? 0) > 0;
  }
}

export default new SistemasExternosService();
