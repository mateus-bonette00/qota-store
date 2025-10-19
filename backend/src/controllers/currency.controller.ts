import { Request, Response, NextFunction } from 'express';
import { currencyService } from '../services/currency.service';

export class CurrencyController {
  async getRates(req: Request, res: Response, next: NextFunction) {
    try {
      const rates = await currencyService.getExchangeRates();
      res.json(rates);
    } catch (error) {
      next(error);
    }
  }

  async convert(req: Request, res: Response, next: NextFunction) {
    try {
      const { amount, from, to } = req.body;
      
      if (!amount || !from || !to) {
        return res.status(400).json({ error: 'Parâmetros inválidos' });
      }

      const converted = await currencyService.convert(
        Number(amount),
        from as 'USD' | 'EUR' | 'BRL',
        to as 'USD' | 'EUR' | 'BRL'
      );

      res.json({ amount, from, to, converted });
    } catch (error) {
      next(error);
    }
  }
}