import { Request, Response, NextFunction } from 'express';
import { amazonService } from '../services/amazon-spapi.service';
import { query } from '../config/database';

export class AmazonController {
  /**
   * GET /api/amazon/saldos/latest
   * Retorna o saldo mais recente salvo no banco.
   * Se `?force_refresh=true`, busca na API da Amazon, salva e retorna.
   */
  async getLatestSaldo(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { force_refresh } = req.query as { force_refresh?: string };

      // Força atualização diretamente pela API
      if (force_refresh === 'true') {
        const saldoAPI = await amazonService.getAccountBalance();

        await query(
          `INSERT INTO amazon_saldos (data, disponivel, pendente, moeda)
           VALUES (NOW(), $1, $2, $3)`,
          [saldoAPI.disponivel, saldoAPI.pendente, saldoAPI.moeda]
        );

        res.status(200).json(saldoAPI);
        return;
      }

      // Busca o último registro no banco
      const result = await query(
        `SELECT * FROM amazon_saldos ORDER BY data DESC LIMIT 1`
      );

      if (result.rows.length === 0) {
        // Sem registro no banco? Busca na API, persiste e retorna
        const saldoAPI = await amazonService.getAccountBalance();

        await query(
          `INSERT INTO amazon_saldos (data, disponivel, pendente, moeda)
           VALUES (NOW(), $1, $2, $3)`,
          [saldoAPI.disponivel, saldoAPI.pendente, saldoAPI.moeda]
        );

        res.status(200).json(saldoAPI);
        return;
      }

      res.status(200).json(result.rows[0]);
      return;
    } catch (error) {
      next(error);
      return;
    }
  }

  /**
   * POST /api/amazon/sync/orders
   * Sincroniza pedidos da Amazon dos últimos X dias (default: 7)
   * Body: { "days": number }
   */
  async syncOrders(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { days = 7 } = (req.body || {}) as { days?: number };

      const nDays = Number(days);
      if (!Number.isFinite(nDays) || nDays <= 0) {
        res.status(400).json({ error: 'Parâmetro "days" inválido' });
        return;
      }

      const orders = await amazonService.getRecentOrders(nDays);

      let synced = 0;
      for (const order of orders) {
        // Busca itens do pedido
        const items = await amazonService.getOrderItems(order.AmazonOrderId);

        for (const item of items) {
          // Persistir no banco (ajuste a tabela/colunas conforme seu schema)
          await query(
            `INSERT INTO amazon_receitas 
               (data, quantidade, valor_usd, obs, sku, produto)
             VALUES ($1, $2, $3, $4, $5, $6)
             ON CONFLICT DO NOTHING`,
            [
              order.PurchaseDate,
              item.QuantityOrdered,
              Number(item.ItemPrice?.Amount || 0),
              `Order: ${order.AmazonOrderId}`,
              item.SellerSKU,
              item.Title,
            ]
          );
          synced++;
        }
      }

      res.status(200).json({
        success: true,
        message: `${synced} vendas sincronizadas com sucesso`,
        ordersProcessed: orders.length,
      });
      return;
    } catch (error) {
      next(error);
      return;
    }
  }

  /**
   * GET /api/amazon/test-connection
   * Testa a conexão com a Amazon SP-API
   */
  async testConnection(req: Request, res: Response, _next: NextFunction): Promise<void> {
    try {
      const balance = await amazonService.getAccountBalance();

      res.status(200).json({
        success: true,
        message: 'Conexão com Amazon SP-API funcionando!',
        balance,
      });
      return;
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Erro ao conectar com Amazon SP-API',
        error: error?.message ?? String(error),
      });
      return;
    }
  }
}

export const amazonController = new AmazonController();
