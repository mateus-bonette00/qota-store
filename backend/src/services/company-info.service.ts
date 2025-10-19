import pool from '../database/database';
import { CompanyInfo } from '../models/company-info.model';

export class CompanyInfoService {
  async get(): Promise<CompanyInfo | null> {
    const result = await pool.query(
      'SELECT * FROM company_info ORDER BY id ASC LIMIT 1'
    );
    return result.rows[0] || null;
  }

  async createOrUpdate(companyInfo: Omit<CompanyInfo, 'id' | 'created_at' | 'updated_at'>): Promise<CompanyInfo> {
    const existing = await this.get();

    if (existing) {
      return this.update(existing.id!, companyInfo);
    }

    const {
      nome_empresa,
      ein,
      endereco,
      telefone,
      email_corporativo,
      nome_daniel,
      endereco_envio_prep,
      nome_cartao_mercury,
      numero_cartao_mercury,
      data_vencimento_cartao,
      cvc_cartao
    } = companyInfo;

    const result = await pool.query(
      `INSERT INTO company_info (
        nome_empresa, ein, endereco, telefone, email_corporativo,
        nome_daniel, endereco_envio_prep, nome_cartao_mercury,
        numero_cartao_mercury, data_vencimento_cartao, cvc_cartao
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *`,
      [
        nome_empresa,
        ein || null,
        endereco || null,
        telefone || null,
        email_corporativo || null,
        nome_daniel || null,
        endereco_envio_prep || null,
        nome_cartao_mercury || null,
        numero_cartao_mercury || null,
        data_vencimento_cartao || null,
        cvc_cartao || null
      ]
    );

    return result.rows[0];
  }

  async update(id: number, companyInfo: Partial<CompanyInfo>): Promise<CompanyInfo> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    const fieldMap: { [key: string]: any } = {
      nome_empresa: companyInfo.nome_empresa,
      ein: companyInfo.ein,
      endereco: companyInfo.endereco,
      telefone: companyInfo.telefone,
      email_corporativo: companyInfo.email_corporativo,
      nome_daniel: companyInfo.nome_daniel,
      endereco_envio_prep: companyInfo.endereco_envio_prep,
      nome_cartao_mercury: companyInfo.nome_cartao_mercury,
      numero_cartao_mercury: companyInfo.numero_cartao_mercury,
      data_vencimento_cartao: companyInfo.data_vencimento_cartao,
      cvc_cartao: companyInfo.cvc_cartao
    };

    for (const [key, value] of Object.entries(fieldMap)) {
      if (value !== undefined) {
        fields.push(`${key} = $${paramIndex++}`);
        values.push(value);
      }
    }

    if (fields.length === 0) {
      const current = await this.get();
      return current!;
    }

    values.push(id);
    const query = `UPDATE company_info SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`;
    const result = await pool.query(query, values);

    return result.rows[0];
  }
}

export default new CompanyInfoService();
