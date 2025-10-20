import { pool } from '../config/database';
import { Senha } from '../models/senha.model';

export class SenhasService {
  async list(): Promise<Senha[]> {
    const result = await pool.query(
      'SELECT * FROM senhas ORDER BY nome_sistema ASC'
    );
    return result.rows;
  }

  async getById(id: number): Promise<Senha | null> {
    const result = await pool.query('SELECT * FROM senhas WHERE id = $1', [id]);
    return result.rows[0] || null;
  }

  async create(senha: Omit<Senha, 'id' | 'created_at' | 'updated_at'>): Promise<Senha> {
    const { nome_sistema, url, usuario_email, senha: password, observacoes } = senha;

    const result = await pool.query(
      `INSERT INTO senhas (nome_sistema, url, usuario_email, senha, observacoes)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [nome_sistema, url || null, usuario_email || null, password || null, observacoes || null]
    );

    return result.rows[0];
  }

  async update(id: number, senha: Partial<Senha>): Promise<Senha> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    const fieldMap: { [key: string]: any } = {
      nome_sistema: senha.nome_sistema,
      url: senha.url,
      usuario_email: senha.usuario_email,
      senha: senha.senha,
      observacoes: senha.observacoes,
    };

    for (const [key, value] of Object.entries(fieldMap)) {
      if (value !== undefined) {
        fields.push(`${key} = $${paramIndex++}`);
        values.push(value);
      }
    }

    if (fields.length === 0) {
      const current = await this.getById(id);
      return current!;
    }

    values.push(id);
    const query = `UPDATE senhas SET ${fields.join(', ')}, updated_at = NOW() WHERE id = $${paramIndex} RETURNING *`;
    const result = await pool.query(query, values);

    return result.rows[0];
  }

  async delete(id: number): Promise<void> {
    await pool.query('DELETE FROM senhas WHERE id = $1', [id]);
  }
}

export default new SenhasService();
