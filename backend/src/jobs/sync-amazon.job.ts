import cron from 'node-cron';
import { amazonSPAPIService } from '../services/amazon-spapi.service';
import { receitasService } from '../services/receitas.service';
import { produtosService } from '../services/produtos.service';
import { query } from '../config/database';

export class AmazonSyncJob {
  private isRunning = false;

  /**
   * Sincronizar vendas da Amazon
   * Roda a cada 4 horas
   */
  start() {
    // A cada 4 horas
    cron.schedule('0 */4 * * *', async () => {
      if (this.isRunning) {
        console.log('[Amazon Sync] Job já está rodando, pulando...');
        return;
      }

      this.isRunning = true;
      console.log('[Amazon Sync] Iniciando sincronização...', new Date().toISOString());

      try {
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
   * Sincronizar ordens/vendas
   */
  private async syncOrders() {
    try {
      const orders = await amazonSPAPIService.getRecentOrders(7); // Últimos 7 dias
      let novos = 0;
      let atualizados = 0;

      for (const order of orders) {
        // Buscar itens da ordem
        const items = await amazonSPAPIService.getOrderItems(order.orderId);

        for (const item of items) {
          // Buscar produto por SKU
          const produto = await produtosService.findBySKU(item.sku);

          // Verificar se já existe receita para este item
          const existing = await query(
            `SELECT id FROM receitas WHERE asin = $1 AND sku = $2 AND data = $3`,
            [item.asin, item.sku, order.purchaseDate.split('T')[0]]
          );

          if (existing.rows.length === 0) {
            // Criar nova receita
            await receitasService.createFromAmazonOrder({
              data: order.purchaseDate.split('T')[0],
              sku: item.sku,
              asin: item.asin,
              quantidade: item.quantityOrdered,
              valor_unitario: item.itemPrice ? parseFloat(item.itemPrice.amount) : 0,
              produto_id: produto?.id
            });

            // Reduzir estoque se produto encontrado
            if (produto) {
              await produtosService.reduzirEstoque(produto.id!, item.quantityOrdered);
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
   * Sincronizar saldo
   */
  private async syncBalance() {
    try {
      const balance = await amazonSPAPIService.getAccountBalance();

      // Verificar se já existe saldo para hoje
      const hoje = new Date().toISOString().split('T')[0];
      const existing = await query(
        'SELECT id FROM amazon_saldos WHERE data = $1',
        [hoje]
      );

      if (existing.rows.length === 0) {
        // Inserir novo saldo
        await query(
          `INSERT INTO amazon_saldos (data, disponivel, pendente, moeda)
           VALUES ($1, $2, $3, $4)`,
          [hoje, balance.disponivel, balance.pendente, balance.moeda]
        );

        console.log(`[Amazon Sync] Saldo sincronizado: $${balance.disponivel}`);
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
  ) {
    await query(
      `INSERT INTO amazon_sync_log (tipo, status, registros_novos, registros_atualizados, erro)
       VALUES ($1, $2, $3, $4, $5)`,
      [tipo, status, novos, atualizados, erro || null]
    );
  }

  /**
   * Executar sync manualmente
   */
  async runManually() {
    if (this.isRunning) {
      throw new Error('Sincronização já está em andamento');
    }

    this.isRunning = true;
    try {
      await this.syncOrders();
      await this.syncBalance();
      return { success: true };
    } finally {
      this.isRunning = false;
    }
  }
}

export const amazonSyncJob = new AmazonSyncJob();