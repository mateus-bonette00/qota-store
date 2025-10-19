import { Request, Response, NextFunction } from 'express';
import { currencyService } from '../services/currency.service';

type Currency = 'USD' | 'EUR' | 'BRL';

export class CurrencyController {
  async getRates(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const rates = await currencyService.getExchangeRates();
      res.status(200).json(rates);
      return;
    } catch (error) {
      next(error);
      return;
    }
  }

  async convert(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { amount, from, to } = req.body as {
        amount?: number;
        from?: Currency;
        to?: Currency;
      };

      if (typeof amount !== 'number' || !from || !to) {
        res.status(400).json({ error: 'Parâmetros inválidos' });
        return;
      }

      const converted = await currencyService.convert(Number(amount), from, to);
      res.status(200).json({ amount, from, to, converted });
      return;
    } catch (error) {
      next(error);
      return;
    }
  }
}

export const currencyController = new CurrencyController();
