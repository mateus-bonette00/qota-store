import { Request, Response, NextFunction } from 'express';
import { amazonService } from '../services/amazon-spapi.service';
import { query } from '../config/database';

export class AmazonController {
  /**
   * GET /api/amazon/saldos/latest
   * Busca saldo mais recente (banco ou API)
   */
  async getLatestSaldo(req: Request, res: Response, next: NextFunction) {
    try {
      const { force_refresh } = req.query;

      // Se force_refresh=true, busca da API
      if (force_refresh === 'true') {
        const saldoAPI = await amazonService.getAccountBalance();
        
        // Salvar no banco
        await query(
          `INSERT INTO amazon_saldos (data, disponivel, pendente, moeda)
           VALUES (NOW(), $1, $2, $3)`,
          [saldoAPI.disponivel, saldoAPI.pendente, saldoAPI.moeda]
        );

        return res.json(saldoAPI);
      }

      // Buscar do banco (mais recente)
      const result = await query(
        'SELECT * FROM amazon_saldos ORDER BY data DESC LIMIT 1'
      );

      if (result.rows.length === 0) {
        // Se não tem no banco, busca da API
        const saldoAPI = await amazonService.getAccountBalance();
        
        await query(
          `INSERT INTO amazon_saldos (data, disponivel, pendente, moeda)
           VALUES (NOW(), $1, $2, $3)`,
          [saldoAPI.disponivel, saldoAPI.pendente, saldoAPI.moeda]
        );

        return res.json(saldoAPI);
      }

      res.json(result.rows[0]);

    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/amazon/sync/orders
   * Sincroniza pedidos da Amazon dos últimos X dias
   */
  async syncOrders(req: Request, res: Response, next: NextFunction) {
    try {
      const { days = 7 } = req.body;

      const orders = await amazonService.getRecentOrders(days);
      
      let synced = 0;
      for (const order of orders) {
        // Buscar itens do pedido
        const items = await amazonService.getOrderItems(order.AmazonOrderId);
        
        for (const item of items) {
          // Salvar no banco
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
              item.Title
            ]
          );
          synced++;
        }
      }

      res.json({
        success: true,
        message: `${synced} vendas sincronizadas com sucesso`,
        ordersProcessed: orders.length
      });

    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/amazon/test-connection
   * Testar conexão com Amazon SP-API
   */
  async testConnection(req: Request, res: Response, next: NextFunction) {
    try {
      const balance = await amazonService.getAccountBalance();
      
      res.json({
        success: true,
        message: 'Conexão com Amazon SP-API funcionando!',
        balance
      });

    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Erro ao conectar com Amazon SP-API',
        error: error.message
      });
    }
  }
}

export const amazonController = new AmazonController();