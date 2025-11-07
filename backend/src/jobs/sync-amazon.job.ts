import cron from 'node-cron';
import { receitasService } from '../services/receitas.service';
import { produtosService } from '../services/produtos.service';
import { query } from '../config/database';
import { amazonService } from '../services/amazon-spapi.service';

export class AmazonSyncJob {
  private isRunning = false;

  /**
   * Inicia o agendamento (a cada 4 horas)
   */
  start(): void {
    cron.schedule('0 */4 * * *', async () => {
      if (this.isRunning) {
        console.log('[Amazon Sync] Job já está rodando, pulando...');
        return;
      }

      this.isRunning = true;
      console.log('[Amazon Sync] Iniciando sincronização...', new Date().toISOString());

      try {
        await this.syncInventory();
        await this.syncOrders();
        await this.syncBalance();
      } catch (error) {
        console.error('[Amazon Sync] Erro:', error);
        await this.logSync('orders', 'error', 0, 0, String(error));
      } finally {
        this.isRunning = false;
      }
    });

    console.log('[Amazon Sync Job] Agendado para rodar a cada 4 horas');
  }

  /**
   * Sincronizar inventário FBA
   */
  private async syncInventory(): Promise<{ criados: number; atualizados: number }> {
    try {
      const inventory = await amazonService.getFBAInventory();
      let criados = 0;
      let atualizados = 0;

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
          atualizados++;
        } else {
          // Criar novo produto
          await query(
            `INSERT INTO produtos
               (data_add, nome, sku, asin, estoque, quantidade)
             VALUES (NOW(), $1, $2, $3, $4, $5)`,
            [productName, sku, asin, totalQuantity, totalQuantity]
          );
          criados++;
        }
      }

      await this.logSync('inventory', 'success', criados, atualizados);
      console.log(`[Amazon Sync] Inventário sincronizado: ${criados} novos, ${atualizados} atualizados`);
      return { criados, atualizados };
    } catch (error) {
      console.error('[Amazon Sync] Erro ao sincronizar inventário:', error);
      throw error;
    }
  }

  /**
   * Sincronizar ordens/vendas (últimos 7 dias por padrão)
   */
  private async syncOrders(days = 7): Promise<{ novos: number; atualizados: number }> {
    try {
      const orders = await amazonService.getRecentOrders(days);
      let novos = 0;
      let atualizados = 0;

      for (const order of orders) {
        const orderId: string = order.AmazonOrderId || order.orderId;
        const purchaseDateISO: string = order.PurchaseDate || order.purchaseDate;
        const purchaseDate = purchaseDateISO ? String(purchaseDateISO).split('T')[0] : null;

        if (!orderId || !purchaseDate) {
          // pular pedidos sem dados essenciais
          continue;
        }

        const items = await amazonService.getOrderItems(orderId);

        for (const item of items) {
          const sku: string | null = item.SellerSKU ?? item.sku ?? null;
          const asin: string | null = item.ASIN ?? item.asin ?? null;
          const quantity: number = Number(item.QuantityOrdered ?? item.quantityOrdered ?? 0);
          const unitUsd: number = Number(item.ItemPrice?.Amount ?? item.itemPrice?.amount ?? 0);

          // localizar produto pelo SKU (se houver)
          const produto = sku ? await produtosService.findBySKU(sku) : null;

          // já existe receita igual para a mesma data?
          const existing = await query(
            `SELECT id FROM receitas WHERE asin = $1 AND sku = $2 AND data = $3`,
            [asin, sku, purchaseDate]
          );

          if (existing.rows.length === 0) {
            // cria receita
            await receitasService.createFromAmazonOrder({
              data: purchaseDate,
              sku: sku ?? '',
              asin: asin ?? '',
              quantidade: quantity,
              valor_unitario: unitUsd,
              produto_id: produto?.id,
            });

            // reduz estoque, se houver produto
            if (produto && quantity > 0) {
              await produtosService.reduzirEstoque(produto.id!, quantity);
            }

            novos++;
          } else {
            atualizados++;
          }
        }
      }

      await this.logSync('orders', 'success', novos, atualizados);
      console.log(`[Amazon Sync] Ordens sincronizadas: ${novos} novas, ${atualizados} existentes`);
      return { novos, atualizados };
    } catch (error) {
      console.error('[Amazon Sync] Erro ao sincronizar ordens:', error);
      throw error;
    }
  }

  /**
   * Sincronizar/registrar saldo do dia
   */
  private async syncBalance(): Promise<void> {
    try {
      const balance = await amazonService.getAccountBalance();

      const hoje = new Date().toISOString().split('T')[0];
      const existing = await query(
        'SELECT id FROM amazon_saldos WHERE data = $1',
        [hoje]
      );

      if (existing.rows.length === 0) {
        await query(
          `INSERT INTO amazon_saldos (data, disponivel, pendente, moeda)
           VALUES ($1, $2, $3, $4)`,
          [hoje, balance.disponivel, balance.pendente, balance.moeda]
        );

        console.log(`[Amazon Sync] Saldo sincronizado: ${balance.disponivel} ${balance.moeda}`);
      } else {
        // Se preferir atualizar o saldo do dia, descomente:
        // await query(
        //   `UPDATE amazon_saldos
        //       SET disponivel = $2, pendente = $3, moeda = $4
        //     WHERE id = $1`,
        //   [existing.rows[0].id, balance.disponivel, balance.pendente, balance.moeda]
        // );
      }

      await this.logSync('balance', 'success', 1, 0);
    } catch (error) {
      console.error('[Amazon Sync] Erro ao sincronizar saldo:', error);
      throw error;
    }
  }

  /**
   * Registrar log de sincronização
   */
  private async logSync(
    tipo: string,
    status: 'success' | 'error',
    novos: number,
    atualizados: number,
    erro?: string
  ): Promise<void> {
    await query(
      `INSERT INTO amazon_sync_log (tipo, status, registros_novos, registros_atualizados, erro)
       VALUES ($1, $2, $3, $4, $5)`,
      [tipo, status, novos, atualizados, erro ?? null]
    );
  }

  /**
   * Executa manualmente (sem esperar o cron)
   */
  async runManually(): Promise<{ success: true }> {
    if (this.isRunning) {
      throw new Error('Sincronização já está em andamento');
    }

    this.isRunning = true;
    try {
      await this.syncInventory();
      await this.syncOrders();
      await this.syncBalance();
      return { success: true };
    } finally {
      this.isRunning = false;
    }
  }
}

export const amazonSyncJob = new AmazonSyncJob();
