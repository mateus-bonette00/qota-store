import axios from 'axios';
import { query } from '../config/database';

interface ExchangeRates {
  USD: number;
  EUR: number;
  BRL: number;
  updated: Date;
}

export class CurrencyService {
  private rates: ExchangeRates | null = null;
  private lastUpdate: number = 0;
  private CACHE_DURATION = 60 * 60 * 1000; // 1 hora

  /**
   * Buscar taxas de câmbio atualizadas
   */
  async getExchangeRates(): Promise<ExchangeRates> {
    // Se cache válido, retorna
    if (this.rates && (Date.now() - this.lastUpdate) < this.CACHE_DURATION) {
      return this.rates;
    }

    try {
      // API gratuita de taxas de câmbio
      const response = await axios.get('https://api.exchangerate-api.com/v4/latest/USD');
      
      this.rates = {
        USD: 1,
        BRL: response.data.rates.BRL,
        EUR: response.data.rates.EUR,
        updated: new Date()
      };

      this.lastUpdate = Date.now();

      // Salvar no banco para histórico
      await query(
        `INSERT INTO exchange_rates (data, usd_to_brl, usd_to_eur)
         VALUES (NOW(), $1, $2)`,
        [this.rates.BRL, this.rates.EUR]
      );

      return this.rates;

    } catch (error) {
      console.error('Erro ao buscar taxas de câmbio:', error);
      
      // Fallback: buscar última taxa do banco
      const result = await query(
        'SELECT * FROM exchange_rates ORDER BY data DESC LIMIT 1'
      );

      if (result.rows.length > 0) {
        const row = result.rows[0];
        return {
          USD: 1,
          BRL: Number(row.usd_to_brl),
          EUR: Number(row.usd_to_eur),
          updated: row.data
        };
      }

      // Se nem no banco tem, usa valores padrão
      return {
        USD: 1,
        BRL: 5.20,
        EUR: 0.92,
        updated: new Date()
      };
    }
  }

  /**
   * Converter valor entre moedas
   */
  async convert(amount: number, from: 'USD' | 'EUR' | 'BRL', to: 'USD' | 'EUR' | 'BRL'): Promise<number> {
    if (from === to) return amount;

    const rates = await this.getExchangeRates();

    // Converter tudo para USD primeiro
    let amountInUSD = amount;
    if (from === 'BRL') {
      amountInUSD = amount / rates.BRL;
    } else if (from === 'EUR') {
      amountInUSD = amount / rates.EUR;
    }

    // Converter de USD para moeda de destino
    if (to === 'BRL') {
      return amountInUSD * rates.BRL;
    } else if (to === 'EUR') {
      return amountInUSD * rates.EUR;
    }

    return amountInUSD;
  }
}

export const currencyService = new CurrencyService();