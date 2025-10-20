import { pool } from '../config/database';
import { SenhaFornecedor } from '../models/senha-fornecedor.model';

export class SenhasFornecedoresService {
  async list(): Promise<SenhaFornecedor[]> {
    const result = await pool.query(
      'SELECT * FROM senhas_fornecedores ORDER BY nome_fornecedor ASC'
    );
    return result.rows;
  }

  async getById(id: number): Promise<SenhaFornecedor | null> {
    const result = await pool.query('SELECT * FROM senhas_fornecedores WHERE id = $1', [id]);
    return result.rows[0] || null;
  }

  async create(senha: Omit<SenhaFornecedor, 'id' | 'created_at' | 'updated_at'>): Promise<SenhaFornecedor> {
    const { nome_fornecedor, url, usuario_email, senha: password, observacoes } = senha;

    const result = await pool.query(
      `INSERT INTO senhas_fornecedores (nome_fornecedor, url, usuario_email, senha, observacoes)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [nome_fornecedor, url || null, usuario_email || null, password || null, observacoes || null]
    );

    return result.rows[0];
  }

  async update(id: number, senha: Partial<SenhaFornecedor>): Promise<SenhaFornecedor> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    const fieldMap: { [key: string]: any } = {
      nome_fornecedor: senha.nome_fornecedor,
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
    const query = `UPDATE senhas_fornecedores SET ${fields.join(', ')}, updated_at = NOW() WHERE id = $${paramIndex} RETURNING *`;
    const result = await pool.query(query, values);

    return result.rows[0];
  }

  async delete(id: number): Promise<void> {
    await pool.query('DELETE FROM senhas_fornecedores WHERE id = $1', [id]);
  }
}

export default new SenhasFornecedoresService();
