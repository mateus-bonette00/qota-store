import { amazonSyncJob } from './sync-amazon.job';
import { exchangeRatesJob } from './update-exchange-rates.job';

export function startCronJobs() {
  console.log('🕐 Iniciando Cron Jobs...');

  amazonSyncJob.start();
  exchangeRatesJob.start();

  console.log('✅ Cron Jobs iniciados com sucesso!');
}

export { amazonSyncJob, exchangeRatesJob };