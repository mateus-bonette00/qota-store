import pool from '../database/database';
import { Fornecedor } from '../models/fornecedor.model';

export class FornecedoresService {
  async getAll(): Promise<Fornecedor[]> {
    const result = await pool.query(
      'SELECT * FROM fornecedores ORDER BY nome ASC'
    );
    return result.rows;
  }

  async getById(id: number): Promise<Fornecedor | null> {
    const result = await pool.query(
      'SELECT * FROM fornecedores WHERE id = $1',
      [id]
    );
    return result.rows[0] || null;
  }

  async create(fornecedor: Omit<Fornecedor, 'id' | 'created_at' | 'updated_at'>): Promise<Fornecedor> {
    const { nome, url, usuario_email, senha, observacoes } = fornecedor;

    const result = await pool.query(
      `INSERT INTO fornecedores (nome, url, usuario_email, senha, observacoes)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [nome, url || null, usuario_email || null, senha || null, observacoes || null]
    );

    return result.rows[0];
  }

  async update(id: number, fornecedor: Partial<Fornecedor>): Promise<Fornecedor | null> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (fornecedor.nome !== undefined) {
      fields.push(`nome = $${paramIndex++}`);
      values.push(fornecedor.nome);
    }
    if (fornecedor.url !== undefined) {
      fields.push(`url = $${paramIndex++}`);
      values.push(fornecedor.url);
    }
    if (fornecedor.usuario_email !== undefined) {
      fields.push(`usuario_email = $${paramIndex++}`);
      values.push(fornecedor.usuario_email);
    }
    if (fornecedor.senha !== undefined) {
      fields.push(`senha = $${paramIndex++}`);
      values.push(fornecedor.senha);
    }
    if (fornecedor.observacoes !== undefined) {
      fields.push(`observacoes = $${paramIndex++}`);
      values.push(fornecedor.observacoes);
    }

    if (fields.length === 0) {
      return this.getById(id);
    }

    values.push(id);
    const query = `UPDATE fornecedores SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`;
    const result = await pool.query(query, values);

    return result.rows[0] || null;
  }

  async delete(id: number): Promise<boolean> {
    const result = await pool.query(
      'DELETE FROM fornecedores WHERE id = $1',
      [id]
    );
    return (result.rowCount ?? 0) > 0;
  }

  async search(searchTerm: string): Promise<Fornecedor[]> {
    const result = await pool.query(
      `SELECT * FROM fornecedores
       WHERE nome ILIKE $1 OR url ILIKE $1 OR usuario_email ILIKE $1
       ORDER BY nome ASC`,
      [`%${searchTerm}%`]
    );
    return result.rows;
  }
}

export default new FornecedoresService();
