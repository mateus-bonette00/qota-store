import { query } from '../config/database';

interface ResumoMensal {
  recUSD: number;
  recBRL: number;
  despUSD: number;
  despBRL: number;
}

interface Lucros {
  lucroPeriodo: number;
  lucroTotal: number;
}

interface SerieMensal {
  mes: string;
  receitas_amz: number;
  despesas_totais: number;
  resultado: number;
}

export class MetricsService {
  async getResumoMensal(month?: string): Promise<ResumoMensal> {
    const monthFilter = month ? `WHERE to_char(data, 'YYYY-MM') = $1` : '';
    const params = month ? [month] : [];

    // Buscar gastos
    const gastosQuery = await query(
      `SELECT 
        COALESCE(SUM(valor_brl), 0) as total_brl,
        COALESCE(SUM(valor_usd), 0) as total_usd
      FROM gastos ${monthFilter}`,
      params
    );

    // Buscar investimentos
    const invQuery = await query(
      `SELECT 
        COALESCE(SUM(valor_brl), 0) as total_brl,
        COALESCE(SUM(valor_usd), 0) as total_usd
      FROM investimentos ${monthFilter}`,
      params
    );

    // Buscar receitas Amazon
    const amzQuery = await query(
      `SELECT COALESCE(SUM(valor_usd), 0) as total_usd
      FROM amazon_receitas ${monthFilter}`,
      params
    );

    // Buscar receitas gerais
    const recQuery = await query(
      `SELECT 
        COALESCE(SUM(valor_brl), 0) as total_brl,
        COALESCE(SUM(valor_usd), 0) as total_usd
      FROM receitas ${monthFilter}`,
      params
    );

    // Calcular compras de produtos
    const prodsFilter = month 
      ? `WHERE to_char(COALESCE(data_amz, data_add), 'YYYY-MM') = $1` 
      : '';
    
    const prodsQuery = await query(
      `SELECT 
        custo_base, prep, amazon_fees, quantidade, freight, tax
      FROM produtos ${prodsFilter}`,
      params
    );

    let comprasUSD = 0;
    prodsQuery.rows.forEach((p: any) => {
      const qty = Number(p.quantidade || 0);
      const unit = (Number(p.custo_base || 0) + Number(p.prep || 0) + Number(p.amazon_fees || 0)) * qty;
      const total = unit + Number(p.freight || 0) + Number(p.tax || 0);
      comprasUSD += total;
    });

    const recUSD = Number(amzQuery.rows[0].total_usd) + Number(recQuery.rows[0].total_usd);
    const recBRL = Number(recQuery.rows[0].total_brl);

    const despUSD = 
      Number(gastosQuery.rows[0].total_usd) + 
      Number(invQuery.rows[0].total_usd) + 
      comprasUSD;

    const despBRL = 
      Number(gastosQuery.rows[0].total_brl) + 
      Number(invQuery.rows[0].total_brl);

    return { recUSD, recBRL, despUSD, despBRL };
  }

  async getTotaisAcumulados(): Promise<ResumoMensal> {
    return this.getResumoMensal();
  }

  async calcularLucros(month?: string): Promise<Lucros> {
    const prodsQuery = await query('SELECT * FROM produtos');
    const produtos = prodsQuery.rows;

    const prodsMap = new Map();
    produtos.forEach((p: any) => {
      const qty = Number(p.quantidade || 0);
      const base = Number(p.custo_base || 0);
      const tax = Number(p.tax || 0);
      const freight = Number(p.freight || 0);
      const rateio = qty > 0 ? (tax + freight) / qty : 0;
      const p2b = base + rateio;

      const sold = Number(p.sold_for || 0);
      const amzFees = Number(p.amazon_fees || 0);
      const prep = Number(p.prep || 0);
      const gpUnit = sold - amzFees - prep - p2b;

      prodsMap.set(p.id, { ...p, gpUnit });
    });

    const amzQuery = await query('SELECT * FROM amazon_receitas');
    const receitas = amzQuery.rows;

    let lucroTotal = 0;
    let lucroPeriodo = 0;

    receitas.forEach((r: any) => {
      const prod = prodsMap.get(r.produto_id);
      if (!prod) return;

      const lucro = prod.gpUnit * Number(r.quantidade || 0);
      lucroTotal += lucro;

      if (month && r.data) {
        const rMonth = r.data.toString().substring(0, 7);
        if (rMonth === month) {
          lucroPeriodo += lucro;
        }
      }
    });

    if (!month) {
      lucroPeriodo = lucroTotal;
    }

    return { lucroPeriodo, lucroTotal };
  }

  async getSerieMensal(): Promise<SerieMensal[]> {
    const amzQuery = await query(`
      SELECT 
        to_char(data, 'YYYY-MM') as mes,
        COALESCE(SUM(valor_usd), 0) as total
      FROM amazon_receitas
      GROUP BY mes
      ORDER BY mes
    `);

    const gastosQuery = await query(`
      SELECT 
        to_char(data, 'YYYY-MM') as mes,
        COALESCE(SUM(valor_usd), 0) as total
      FROM gastos
      GROUP BY mes
      ORDER BY mes
    `);

    const invQuery = await query(`
      SELECT 
        to_char(data, 'YYYY-MM') as mes,
        COALESCE(SUM(valor_usd), 0) as total
      FROM investimentos
      GROUP BY mes
      ORDER BY mes
    `);

    const prodsQuery = await query(`
      SELECT 
        to_char(COALESCE(data_amz, data_add), 'YYYY-MM') as mes,
        custo_base, prep, amazon_fees, quantidade, freight, tax
      FROM produtos
    `);

    const receitasMap = new Map();
    amzQuery.rows.forEach((r: any) => receitasMap.set(r.mes, Number(r.total)));

    const gastosMap = new Map();
    gastosQuery.rows.forEach((r: any) => gastosMap.set(r.mes, Number(r.total)));

    const invMap = new Map();
    invQuery.rows.forEach((r: any) => invMap.set(r.mes, Number(r.total)));

    const comprasMap = new Map<string, number>();
    prodsQuery.rows.forEach((p: any) => {
      const mes = p.mes;
      if (!mes) return;
      
      const qty = Number(p.quantidade || 0);
      const unit = (Number(p.custo_base || 0) + Number(p.prep || 0) + Number(p.amazon_fees || 0)) * qty;
      const total = unit + Number(p.freight || 0) + Number(p.tax || 0);
      
      comprasMap.set(mes, (comprasMap.get(mes) || 0) + total);
    });

    const meses = new Set<string>();
    receitasMap.forEach((_, mes) => meses.add(mes));
    gastosMap.forEach((_, mes) => meses.add(mes));
    invMap.forEach((_, mes) => meses.add(mes));
    comprasMap.forEach((_, mes) => meses.add(mes));

    const resultado: SerieMensal[] = Array.from(meses)
      .sort()
      .map(mes => {
        const receitas = receitasMap.get(mes) || 0;
        const gastos = gastosMap.get(mes) || 0;
        const inv = invMap.get(mes) || 0;
        const compras = comprasMap.get(mes) || 0;
        const despesas = gastos + inv + compras;

        return {
          mes,
          receitas_amz: receitas,
          despesas_totais: despesas,
          resultado: receitas - despesas
        };
      });

    return resultado;
  }

  async getProductSales(params: {
    scope: 'month' | 'year';
    order: 'desc' | 'asc';
    limit: number;
    year?: string;
    month?: string;
  }) {
    const now = new Date();
    const year = params.year || now.getFullYear().toString();
    const month = params.month || (now.getMonth() + 1).toString().padStart(2, '0');

    let whereClause = '';
    let queryParams: string[] = [];

    if (params.scope === 'year') {
      whereClause = `WHERE to_char(ar.data, 'YYYY') = $1`;
      queryParams = [year];
    } else {
      whereClause = `WHERE to_char(ar.data, 'YYYY-MM') = $1`;
      queryParams = [`${year}-${month}`];
    }

    const orderDir = params.order === 'asc' ? 'ASC' : 'DESC';
    const limit = params.limit > 0 ? params.limit : 10;

    const result = await query(
      `
      SELECT
        COALESCE(p.sku, ar.sku, '(sem SKU)') AS sku,
        COALESCE(p.nome, ar.produto, '(sem nome)') AS nome,
        SUM(COALESCE(ar.quantidade, 0))::int AS qty
      FROM amazon_receitas ar
      LEFT JOIN produtos p ON p.id = ar.produto_id
      ${whereClause}
      GROUP BY 1, 2
      ORDER BY qty ${orderDir}
      LIMIT ${limit}
      `,
      queryParams
    );

    return result.rows;
  }

  async getDashboardData(month?: string) {
    const [resumo, totais, lucros, saldo] = await Promise.all([
      this.getResumoMensal(month),
      this.getTotaisAcumulados(),
      this.calcularLucros(month),
      this.getSaldoAmazon()
    ]);

    return {
      month,
      resumo,
      totais,
      lucros,
      saldo
    };
  }

  private async getSaldoAmazon() {
    const result = await query(
      'SELECT * FROM amazon_saldos ORDER BY data DESC LIMIT 1'
    );

    return result.rows[0] || { disponivel: 0, pendente: 0, moeda: 'USD' };
  }
}