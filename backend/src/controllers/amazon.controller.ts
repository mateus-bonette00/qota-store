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

  /**
   * POST /api/amazon/sync/inventory
   * Sincroniza produtos do inventário FBA da Amazon
   */
  async syncInventory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      console.log('🔄 Iniciando sincronização de inventário FBA...');

      const inventory = await amazonService.getFBAInventory();
      console.log(`📦 Encontrados ${inventory.length} produtos no inventário FBA`);

      let created = 0;
      let updated = 0;

      for (const item of inventory) {
        const sku = item.sellerSKU;
        const asin = item.asin;
        const productName = item.productName || 'Produto sem nome';
        const totalQuantity = item.totalQuantity || 0;

        // Verificar se o produto já existe
        const existingProduct = await query(
          `SELECT * FROM produtos WHERE sku = $1 OR asin = $2 LIMIT 1`,
          [sku, asin]
        );

        if (existingProduct.rows.length > 0) {
          // Atualizar estoque
          await query(
            `UPDATE produtos
             SET estoque = $1,
                 asin = COALESCE(asin, $2),
                 updated_at = NOW()
             WHERE id = $3`,
            [totalQuantity, asin, existingProduct.rows[0].id]
          );
          updated++;
          console.log(`✅ Atualizado: ${sku} - Estoque: ${totalQuantity}`);
        } else {
          // Criar novo produto
          await query(
            `INSERT INTO produtos
               (data_add, nome, sku, asin, estoque, quantidade)
             VALUES (NOW(), $1, $2, $3, $4, $5)`,
            [productName, sku, asin, totalQuantity, totalQuantity]
          );
          created++;
          console.log(`➕ Criado: ${sku} - ${productName}`);
        }
      }

      console.log(`✅ Sincronização concluída: ${created} criados, ${updated} atualizados`);

      res.status(200).json({
        success: true,
        message: 'Inventário sincronizado com sucesso',
        summary: {
          total: inventory.length,
          created,
          updated,
        },
      });
      return;
    } catch (error) {
      console.error('❌ Erro ao sincronizar inventário:', error);
      next(error);
      return;
    }
  }

  /**
   * POST /api/amazon/sync/full
   * Sincronização completa: inventário + vendas
   */
  async syncFull(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      console.log('🔄 Iniciando sincronização completa...');

      // 1. Sincronizar inventário
      const inventory = await amazonService.getFBAInventory();
      let productsUpdated = 0;

      for (const item of inventory) {
        const sku = item.sellerSKU;
        const asin = item.asin;
        const productName = item.productName || 'Produto sem nome';
        const totalQuantity = item.totalQuantity || 0;

        const existingProduct = await query(
          `SELECT * FROM produtos WHERE sku = $1 OR asin = $2 LIMIT 1`,
          [sku, asin]
        );

        if (existingProduct.rows.length > 0) {
          await query(
            `UPDATE produtos
             SET estoque = $1, asin = COALESCE(asin, $2), updated_at = NOW()
             WHERE id = $3`,
            [totalQuantity, asin, existingProduct.rows[0].id]
          );
        } else {
          await query(
            `INSERT INTO produtos
               (data_add, nome, sku, asin, estoque, quantidade)
             VALUES (NOW(), $1, $2, $3, $4, $5)`,
            [productName, sku, asin, totalQuantity, totalQuantity]
          );
        }
        productsUpdated++;
      }

      // 2. Sincronizar vendas (últimos 7 dias)
      const orders = await amazonService.getRecentOrders(7);
      let salesSynced = 0;

      for (const order of orders) {
        const items = await amazonService.getOrderItems(order.AmazonOrderId);

        for (const item of items) {
          // Salvar venda
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

          // Atualizar estoque do produto
          await query(
            `UPDATE produtos
             SET estoque = GREATEST(0, estoque - $1)
             WHERE sku = $2`,
            [item.QuantityOrdered, item.SellerSKU]
          );

          salesSynced++;
        }
      }

      console.log(`✅ Sincronização completa: ${productsUpdated} produtos, ${salesSynced} vendas`);

      res.status(200).json({
        success: true,
        message: 'Sincronização completa realizada',
        summary: {
          productsUpdated,
          ordersProcessed: orders.length,
          salesSynced,
        },
      });
      return;
    } catch (error) {
      console.error('❌ Erro na sincronização completa:', error);
      next(error);
      return;
    }
  }
}

export const amazonController = new AmazonController();
