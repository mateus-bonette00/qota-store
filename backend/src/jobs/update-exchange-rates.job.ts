import cron from 'node-cron';
import { currencyService } from '../services/currency.service';

export class ExchangeRatesJob {
  /**
   * Atualizar taxas de câmbio
   * Roda a cada 1 hora
   */
  start() {
    // A cada 1 hora
    cron.schedule('0 * * * *', async () => {
      console.log('[Exchange Rates] Atualizando taxas de câmbio...', new Date().toISOString());

      try {
        const rates = await currencyService.getExchangeRates();
        console.log('[Exchange Rates] Taxas atualizadas:', rates);
      } catch (error) {
        console.error('[Exchange Rates] Erro ao atualizar:', error);
      }
    });

    console.log('[Exchange Rates Job] Agendado para rodar a cada 1 hora');
  }
}

export const exchangeRatesJob = new ExchangeRatesJob();