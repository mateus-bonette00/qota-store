import { query } from '../config/database';
import {
  Produto,
  ProdutoCreate,
  ProdutoUpdate,
  ProdutoWithMetrics,
  ProdutoKanbanColumn,
  ProdutoDashboard,
  ProdutoStatus,
  PRODUTO_STATUS_LABELS
} from '../models/produto.model';
import { currencyService } from './currency.service';

export class ProdutosService {
  /**
   * Listar todos os produtos com filtros
   */
  async list(filters?: {
    status?: ProdutoStatus;
    categoria?: string;
    sku?: string;
    asin?: string;
    fornecedor?: string;
  }): Promise<Produto[]> {
    let sql = 'SELECT * FROM produtos WHERE 1=1';
    const params: any[] = [];
    let paramIndex = 1;

    if (filters?.status) {
      sql += ` AND status = $${paramIndex++}`;
      params.push(filters.status);
    }

    if (filters?.categoria) {
      sql += ` AND categoria = $${paramIndex++}`;
      params.push(filters.categoria);
    }

    if (filters?.sku) {
      sql += ` AND sku ILIKE $${paramIndex++}`;
      params.push(`%${filters.sku}%`);
    }

    if (filters?.asin) {
      sql += ` AND asin = $${paramIndex++}`;
      params.push(filters.asin);
    }

    if (filters?.fornecedor) {
      sql += ` AND fornecedor ILIKE $${paramIndex++}`;
      params.push(`%${filters.fornecedor}%`);
    }

    sql += ' ORDER BY data_add DESC, created_at DESC';

    const result = await query(sql, params);
    return result.rows;
  }

  /**
   * Buscar produto por ID com métricas
   */
  async findById(id: number, withMetrics = false): Promise<Produto | ProdutoWithMetrics | null> {
    if (!withMetrics) {
      const result = await query('SELECT * FROM produtos WHERE id = $1', [id]);
      return result.rows.length > 0 ? result.rows[0] : null;
    }

    const result = await query('SELECT * FROM v_produtos_margem WHERE id = $1', [id]);
    if (result.rows.length === 0) return null;

    const produto = result.rows[0];

    // Buscar métricas de vendas
    const vendasResult = await query(
      `SELECT
        COALESCE(SUM(quantidade), 0) as quantidade_vendida,
        COALESCE(SUM(valor_usd), 0) as receita_total_usd,
        COALESCE(SUM(lucro * (valor_usd / NULLIF(valor, 0))), 0) as lucro_total_usd
      FROM receitas WHERE produto_id = $1`,
      [id]
    );

    const vendas = vendasResult.rows[0];

    // Converter valor do estoque
    const custo_total = Number(produto.custo_total);
    const valor_estoque_usd = await currencyService.convert(
      custo_total * produto.estoque,
      produto.moeda_compra,
      'USD'
    );
    const valor_estoque_brl = await currencyService.convert(
      custo_total * produto.estoque,
      produto.moeda_compra,
      'BRL'
    );

    return {
      ...produto,
      custo_total,
      lucro_unitario: Number(produto.lucro_unitario),
      margem_percentual: Number(produto.margem_percentual),
      valor_estoque_usd,
      valor_estoque_brl,
      quantidade_vendida: Number(vendas.quantidade_vendida),
      receita_total_usd: Number(vendas.receita_total_usd),
      lucro_total_usd: Number(vendas.lucro_total_usd)
    };
  }

  /**
   * Criar novo produto
   */
  async create(data: ProdutoCreate): Promise<Produto> {
    const result = await query(
      `INSERT INTO produtos (
        data_add, nome, sku, upc, asin, status, estoque, quantidade,
        categoria, fornecedor, custo_base, freight, tax, prep,
        moeda_compra, valor_eur, sold_for, amazon_fees,
        link_amazon, link_fornecedor, data_amz
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21)
      RETURNING *`,
      [
        data.data_add,
        data.nome,
        data.sku || null,
        data.upc || null,
        data.asin || null,
        data.status,
        data.estoque,
        data.quantidade,
        data.categoria || null,
        data.fornecedor || null,
        data.custo_base,
        data.freight,
        data.tax,
        data.prep,
        data.moeda_compra,
        data.valor_eur || 0,
        data.sold_for,
        data.amazon_fees,
        data.link_amazon || null,
        data.link_fornecedor || null,
        data.data_amz || null
      ]
    );

    return result.rows[0];
  }

  /**
   * Atualizar produto
   */
  async update(id: number, data: ProdutoUpdate): Promise<Produto | null> {
    const existing = await this.findById(id);
    if (!existing) return null;

    const updates: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    const fields: (keyof ProdutoUpdate)[] = [
      'data_add', 'nome', 'sku', 'upc', 'asin', 'status', 'estoque', 'quantidade',
      'categoria', 'fornecedor', 'custo_base', 'freight', 'tax', 'prep',
      'moeda_compra', 'valor_eur', 'sold_for', 'amazon_fees',
      'link_amazon', 'link_fornecedor', 'data_amz'
    ];

    for (const field of fields) {
      if (data[field] !== undefined) {
        updates.push(`${field} = $${paramIndex++}`);
        params.push(data[field]);
      }
    }

    if (updates.length === 0) return existing;

    params.push(id);
    const sql = `UPDATE produtos SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING *`;

    const result = await query(sql, params);
    return result.rows[0];
  }

  /**
   * Atualizar status do produto (para Kanban drag & drop)
   */
  async updateStatus(id: number, status: ProdutoStatus): Promise<Produto | null> {
    const result = await query(
      'UPDATE produtos SET status = $1 WHERE id = $2 RETURNING *',
      [status, id]
    );
    return result.rows.length > 0 ? result.rows[0] : null;
  }

  /**
   * Deletar produto
   */
  async delete(id: number): Promise<boolean> {
    const result = await query('DELETE FROM produtos WHERE id = $1 RETURNING id', [id]);
    return result.rowCount > 0;
  }

  /**
   * Obter dados para Kanban Board
   */
  async getKanbanData(): Promise<ProdutoKanbanColumn[]> {
    const statuses: ProdutoStatus[] = ['sourcing', 'comprado', 'em_transito', 'no_estoque', 'vendido'];
    const columns: ProdutoKanbanColumn[] = [];

    for (const status of statuses) {
      const produtos = await this.list({ status });

      // Enriquecer com métricas
      const produtosWithMetrics: ProdutoWithMetrics[] = [];
      let total_unidades = 0;
      let valor_total_usd = 0;
      let valor_total_brl = 0;

      for (const p of produtos) {
        const produtoWithMetrics = await this.findById(p.id!, true) as ProdutoWithMetrics;
        if (produtoWithMetrics) {
          produtosWithMetrics.push(produtoWithMetrics);
          total_unidades += produtoWithMetrics.estoque;
          valor_total_usd += produtoWithMetrics.valor_estoque_usd;
          valor_total_brl += produtoWithMetrics.valor_estoque_brl;
        }
      }

      columns.push({
        status,
        label: PRODUTO_STATUS_LABELS[status],
        produtos: produtosWithMetrics,
        total_produtos: produtosWithMetrics.length,
        total_unidades,
        valor_total_usd,
        valor_total_brl
      });
    }

    return columns;
  }

  /**
   * Obter dashboard de produtos
   */
  async getDashboard(): Promise<ProdutoDashboard> {
    // Total de produtos e estoque
    const totaisResult = await query(`
      SELECT
        COUNT(*) as total_produtos,
        COALESCE(SUM(estoque), 0) as total_estoque
      FROM produtos
    `);
    const totais = totaisResult.rows[0];

    // Produtos por status
    const statusResult = await query(`
      SELECT status, COUNT(*) as count
      FROM produtos
      GROUP BY status
    `);
    const produtos_por_status: any = {
      sourcing: 0,
      comprado: 0,
      em_transito: 0,
      no_estoque: 0,
      vendido: 0
    };
    statusResult.rows.forEach(row => {
      produtos_por_status[row.status] = Number(row.count);
    });

    // Valor total do estoque
    const estoqueResult = await query(`
      SELECT
        moeda_compra,
        SUM((custo_base + freight + tax + prep) * estoque) as valor_total
      FROM produtos
      WHERE status IN ('no_estoque', 'em_transito')
      GROUP BY moeda_compra
    `);

    let valor_total_estoque_usd = 0;
    let valor_total_estoque_brl = 0;

    for (const row of estoqueResult.rows) {
      const valor = Number(row.valor_total);
      const moeda = row.moeda_compra as 'USD' | 'BRL' | 'EUR';

      valor_total_estoque_usd += await currencyService.convert(valor, moeda, 'USD');
      valor_total_estoque_brl += await currencyService.convert(valor, moeda, 'BRL');
    }

    // Margem média
    const margemResult = await query(`
      SELECT AVG(margem_percentual) as margem_media
      FROM v_produtos_margem
      WHERE sold_for > 0
    `);
    const margem_media = Number(margemResult.rows[0]?.margem_media) || 0;

    // Top produtos vendidos
    const topVendidosResult = await query(`
      SELECT
        p.id,
        SUM(r.quantidade) as total_vendido
      FROM produtos p
      JOIN receitas r ON r.produto_id = p.id
      GROUP BY p.id
      ORDER BY total_vendido DESC
      LIMIT 10
    `);

    const top_produtos_vendidos: ProdutoWithMetrics[] = [];
    for (const row of topVendidosResult.rows) {
      const produto = await this.findById(row.id, true) as ProdutoWithMetrics;
      if (produto) top_produtos_vendidos.push(produto);
    }

    // Top produtos por margem
    const topMargemResult = await query(`
      SELECT id
      FROM v_produtos_margem
      WHERE sold_for > 0
      ORDER BY margem_percentual DESC
      LIMIT 10
    `);

    const top_produtos_margem: ProdutoWithMetrics[] = [];
    for (const row of topMargemResult.rows) {
      const produto = await this.findById(row.id, true) as ProdutoWithMetrics;
      if (produto) top_produtos_margem.push(produto);
    }

    // Alertas de estoque baixo (configurável, padrão 10)
    const alertasResult = await query(`
      SELECT id
      FROM produtos
      WHERE estoque > 0 AND estoque <= 10 AND status = 'no_estoque'
      ORDER BY estoque ASC
    `);

    const alertas_estoque_baixo: ProdutoWithMetrics[] = [];
    for (const row of alertasResult.rows) {
      const produto = await this.findById(row.id, true) as ProdutoWithMetrics;
      if (produto) alertas_estoque_baixo.push(produto);
    }

    return {
      total_produtos: Number(totais.total_produtos),
      total_estoque: Number(totais.total_estoque),
      valor_total_estoque_usd,
      valor_total_estoque_brl,
      margem_media,
      produtos_por_status,
      top_produtos_vendidos,
      top_produtos_margem,
      alertas_estoque_baixo
    };
  }

  /**
   * Buscar produto por SKU
   */
  async findBySKU(sku: string): Promise<Produto | null> {
    const result = await query('SELECT * FROM produtos WHERE sku = $1', [sku]);
    return result.rows.length > 0 ? result.rows[0] : null;
  }

  /**
   * Buscar produto por ASIN
   */
  async findByASIN(asin: string): Promise<Produto | null> {
    const result = await query('SELECT * FROM produtos WHERE asin = $1', [asin]);
    return result.rows.length > 0 ? result.rows[0] : null;
  }

  /**
   * Reduzir estoque após venda
   */
  async reduzirEstoque(id: number, quantidade: number): Promise<Produto | null> {
    const result = await query(
      `UPDATE produtos
       SET estoque = GREATEST(0, estoque - $1)
       WHERE id = $2
       RETURNING *`,
      [quantidade, id]
    );
    return result.rows.length > 0 ? result.rows[0] : null;
  }
}

export const produtosService = new ProdutosService();
