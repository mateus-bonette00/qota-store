import { query } from '../config/database';
import { Receita, ReceitaCreate, ReceitaUpdate, ReceitaSummary, ReceitasPorProduto } from '../models/receita.model';
import { currencyService } from './currency.service';

export class ReceitasService {
  /**
   * Listar todas as receitas com filtros opcionais
   */
  async list(filters?: {
    mes?: string; // YYYY-MM
    origem?: string;
    produto_id?: number;
    sku?: string;
    dataInicio?: string;
    dataFim?: string;
  }): Promise<Receita[]> {
    let sql = 'SELECT * FROM receitas WHERE 1=1';
    const params: any[] = [];
    let paramIndex = 1;

    if (filters?.mes) {
      sql += ` AND TO_CHAR(data, 'YYYY-MM') = $${paramIndex++}`;
      params.push(filters.mes);
    }

    if (filters?.origem) {
      sql += ` AND origem = $${paramIndex++}`;
      params.push(filters.origem);
    }

    if (filters?.produto_id) {
      sql += ` AND produto_id = $${paramIndex++}`;
      params.push(filters.produto_id);
    }

    if (filters?.sku) {
      sql += ` AND sku = $${paramIndex++}`;
      params.push(filters.sku);
    }

    if (filters?.dataInicio) {
      sql += ` AND data >= $${paramIndex++}`;
      params.push(filters.dataInicio);
    }

    if (filters?.dataFim) {
      sql += ` AND data <= $${paramIndex++}`;
      params.push(filters.dataFim);
    }

    sql += ' ORDER BY data DESC, created_at DESC';

    const result = await query(sql, params);
    return result.rows;
  }

  /**
   * Buscar receita por ID
   */
  async findById(id: number): Promise<Receita | null> {
    const result = await query('SELECT * FROM receitas WHERE id = $1', [id]);
    return result.rows.length > 0 ? result.rows[0] : null;
  }

  /**
   * Criar nova receita com conversão de moeda automática
   */
  async create(data: ReceitaCreate): Promise<Receita> {
    // Converter valores para todas as moedas
    const valor_brl = await currencyService.convert(data.valor, data.moeda, 'BRL');
    const valor_usd = await currencyService.convert(data.valor, data.moeda, 'USD');
    const valor_eur = await currencyService.convert(data.valor, data.moeda, 'EUR');

    // Calcular lucro automaticamente se não fornecido
    const lucro = data.lucro ?? (
      data.bruto - data.cogs - data.taxas_amz - data.ads - data.frete - data.descontos
    );

    const result = await query(
      `INSERT INTO receitas (
        data, origem, descricao, valor, moeda, valor_brl, valor_usd, valor_eur,
        metodo, conta, quem, bruto, cogs, taxas_amz, ads, frete, descontos, lucro,
        produto_id, sku, asin, quantidade
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22)
      RETURNING *`,
      [
        data.data,
        data.origem,
        data.descricao || null,
        data.valor,
        data.moeda,
        valor_brl,
        valor_usd,
        valor_eur,
        data.metodo || null,
        data.conta || null,
        data.quem || null,
        data.bruto,
        data.cogs,
        data.taxas_amz,
        data.ads,
        data.frete,
        data.descontos,
        lucro,
        data.produto_id || null,
        data.sku || null,
        data.asin || null,
        data.quantidade
      ]
    );

    return result.rows[0];
  }

  /**
   * Atualizar receita
   */
  async update(id: number, data: ReceitaUpdate): Promise<Receita | null> {
    const existing = await this.findById(id);
    if (!existing) return null;

    const updates: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    // Se moeda ou valor mudou, recalcular conversões
    if (data.valor !== undefined || data.moeda !== undefined) {
      const valor = data.valor ?? existing.valor;
      const moeda = data.moeda ?? existing.moeda;

      const valor_brl = await currencyService.convert(valor, moeda, 'BRL');
      const valor_usd = await currencyService.convert(valor, moeda, 'USD');
      const valor_eur = await currencyService.convert(valor, moeda, 'EUR');

      updates.push(`valor = $${paramIndex++}`, `moeda = $${paramIndex++}`);
      params.push(valor, moeda);

      updates.push(`valor_brl = $${paramIndex++}`, `valor_usd = $${paramIndex++}`, `valor_eur = $${paramIndex++}`);
      params.push(valor_brl, valor_usd, valor_eur);
    }

    // Campos simples
    const simpleFields: (keyof ReceitaUpdate)[] = [
      'data', 'origem', 'descricao', 'metodo', 'conta', 'quem',
      'bruto', 'cogs', 'taxas_amz', 'ads', 'frete', 'descontos',
      'produto_id', 'sku', 'asin', 'quantidade'
    ];

    for (const field of simpleFields) {
      if (data[field] !== undefined) {
        updates.push(`${field} = $${paramIndex++}`);
        params.push(data[field]);
      }
    }

    // Recalcular lucro se algum componente mudou
    if (data.bruto !== undefined || data.cogs !== undefined || data.taxas_amz !== undefined ||
        data.ads !== undefined || data.frete !== undefined || data.descontos !== undefined) {
      const bruto = data.bruto ?? existing.bruto;
      const cogs = data.cogs ?? existing.cogs;
      const taxas_amz = data.taxas_amz ?? existing.taxas_amz;
      const ads = data.ads ?? existing.ads;
      const frete = data.frete ?? existing.frete;
      const descontos = data.descontos ?? existing.descontos;
      const lucro = bruto - cogs - taxas_amz - ads - frete - descontos;

      updates.push(`lucro = $${paramIndex++}`);
      params.push(lucro);
    }

    if (updates.length === 0) return existing;

    params.push(id);
    const sql = `UPDATE receitas SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING *`;

    const result = await query(sql, params);
    return result.rows[0];
  }

  /**
   * Deletar receita
   */
  async delete(id: number): Promise<boolean> {
    const result = await query('DELETE FROM receitas WHERE id = $1 RETURNING id', [id]);
    return result.rowCount > 0;
  }

  /**
   * Obter resumo financeiro
   */
  async getSummary(filters?: { mes?: string; origem?: string }): Promise<ReceitaSummary> {
    let sql = `
      SELECT
        COALESCE(SUM(bruto * (valor_usd / NULLIF(valor, 0))), 0) as total_bruto_usd,
        COALESCE(SUM(bruto * (valor_brl / NULLIF(valor, 0))), 0) as total_bruto_brl,
        COALESCE(SUM(cogs * (valor_usd / NULLIF(valor, 0))), 0) as total_cogs_usd,
        COALESCE(SUM(cogs * (valor_brl / NULLIF(valor, 0))), 0) as total_cogs_brl,
        COALESCE(SUM(taxas_amz * (valor_usd / NULLIF(valor, 0))), 0) as total_taxas_amz_usd,
        COALESCE(SUM(taxas_amz * (valor_brl / NULLIF(valor, 0))), 0) as total_taxas_amz_brl,
        COALESCE(SUM(ads * (valor_usd / NULLIF(valor, 0))), 0) as total_ads_usd,
        COALESCE(SUM(ads * (valor_brl / NULLIF(valor, 0))), 0) as total_ads_brl,
        COALESCE(SUM(lucro * (valor_usd / NULLIF(valor, 0))), 0) as total_lucro_usd,
        COALESCE(SUM(lucro * (valor_brl / NULLIF(valor, 0))), 0) as total_lucro_brl,
        COUNT(*) as quantidade_vendas
      FROM receitas WHERE 1=1
    `;

    const params: any[] = [];
    let paramIndex = 1;

    if (filters?.mes) {
      sql += ` AND TO_CHAR(data, 'YYYY-MM') = $${paramIndex++}`;
      params.push(filters.mes);
    }

    if (filters?.origem) {
      sql += ` AND origem = $${paramIndex++}`;
      params.push(filters.origem);
    }

    const result = await query(sql, params);
    const row = result.rows[0];

    const total_bruto_usd = Number(row.total_bruto_usd);
    const total_bruto_brl = Number(row.total_bruto_brl);
    const total_lucro_usd = Number(row.total_lucro_usd);
    const quantidade_vendas = Number(row.quantidade_vendas);

    return {
      total_bruto_usd,
      total_bruto_brl,
      total_cogs_usd: Number(row.total_cogs_usd),
      total_cogs_brl: Number(row.total_cogs_brl),
      total_taxas_amz_usd: Number(row.total_taxas_amz_usd),
      total_taxas_amz_brl: Number(row.total_taxas_amz_brl),
      total_ads_usd: Number(row.total_ads_usd),
      total_ads_brl: Number(row.total_ads_brl),
      total_lucro_usd,
      total_lucro_brl: Number(row.total_lucro_brl),
      quantidade_vendas,
      ticket_medio_usd: quantidade_vendas > 0 ? total_bruto_usd / quantidade_vendas : 0,
      ticket_medio_brl: quantidade_vendas > 0 ? total_bruto_brl / quantidade_vendas : 0,
      margem_media: total_bruto_usd > 0 ? (total_lucro_usd / total_bruto_usd) * 100 : 0
    };
  }

  /**
   * Obter receitas agrupadas por produto
   */
  async getReceitasPorProduto(filters?: { mes?: string }): Promise<ReceitasPorProduto[]> {
    let sql = `
      SELECT
        r.produto_id,
        p.nome as produto_nome,
        r.sku,
        r.asin,
        SUM(r.quantidade) as quantidade_total,
        SUM(r.valor_usd) as receita_total_usd,
        SUM(r.valor_brl) as receita_total_brl,
        SUM(r.lucro * (r.valor_usd / NULLIF(r.valor, 0))) as lucro_total_usd,
        SUM(r.lucro * (r.valor_brl / NULLIF(r.valor, 0))) as lucro_total_brl,
        AVG((r.lucro / NULLIF(r.bruto, 0)) * 100) as margem_media
      FROM receitas r
      LEFT JOIN produtos p ON p.id = r.produto_id
      WHERE r.produto_id IS NOT NULL
    `;

    const params: any[] = [];
    let paramIndex = 1;

    if (filters?.mes) {
      sql += ` AND TO_CHAR(r.data, 'YYYY-MM') = $${paramIndex++}`;
      params.push(filters.mes);
    }

    sql += `
      GROUP BY r.produto_id, p.nome, r.sku, r.asin
      ORDER BY receita_total_usd DESC
    `;

    const result = await query(sql, params);
    return result.rows.map(row => ({
      produto_id: row.produto_id,
      produto_nome: row.produto_nome || 'Produto sem nome',
      sku: row.sku || '',
      asin: row.asin || '',
      quantidade_total: Number(row.quantidade_total),
      receita_total_usd: Number(row.receita_total_usd),
      receita_total_brl: Number(row.receita_total_brl),
      lucro_total_usd: Number(row.lucro_total_usd),
      lucro_total_brl: Number(row.lucro_total_brl),
      margem_media: Number(row.margem_media) || 0
    }));
  }

  /**
   * Criar receita a partir de ordem da Amazon
   */
  async createFromAmazonOrder(orderData: {
    data: string;
    sku: string;
    asin: string;
    quantidade: number;
    valor_unitario: number; // In USD
    produto_id?: number;
  }): Promise<Receita> {
    // Buscar dados do produto se tiver produto_id
    let custos = {
      custo_base: 0,
      freight: 0,
      tax: 0,
      prep: 0,
      sold_for: orderData.valor_unitario,
      amazon_fees: orderData.valor_unitario * 0.15 // Default 15%
    };

    if (orderData.produto_id) {
      const produtoResult = await query(
        'SELECT custo_base, freight, tax, prep, sold_for, amazon_fees FROM produtos WHERE id = $1',
        [orderData.produto_id]
      );

      if (produtoResult.rows.length > 0) {
        const p = produtoResult.rows[0];
        custos = {
          custo_base: Number(p.custo_base),
          freight: Number(p.freight),
          tax: Number(p.tax),
          prep: Number(p.prep),
          sold_for: Number(p.sold_for),
          amazon_fees: Number(p.amazon_fees)
        };
      }
    }

    const cogs = custos.custo_base + custos.freight + custos.tax + custos.prep;
    const bruto = orderData.valor_unitario * orderData.quantidade;
    const taxas_amz = custos.amazon_fees * orderData.quantidade;
    const lucro = bruto - (cogs * orderData.quantidade) - taxas_amz;

    const receitaData: ReceitaCreate = {
      data: orderData.data,
      origem: 'FBA',
      descricao: `Venda Amazon - ${orderData.sku}`,
      valor: bruto,
      moeda: 'USD',
      valor_brl: 0, // Will be calculated in create()
      valor_usd: bruto,
      valor_eur: 0,
      bruto,
      cogs: cogs * orderData.quantidade,
      taxas_amz,
      ads: 0,
      frete: 0,
      descontos: 0,
      lucro,
      produto_id: orderData.produto_id,
      sku: orderData.sku,
      asin: orderData.asin,
      quantidade: orderData.quantidade
    };

    return this.create(receitaData);
  }
}

export const receitasService = new ReceitasService();
