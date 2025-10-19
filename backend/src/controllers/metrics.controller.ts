import { Request, Response, NextFunction } from 'express';
import { MetricsService } from '../services/metrics.service';

export class MetricsController {
  private service: MetricsService;

  constructor() {
    this.service = new MetricsService();
  }

  getResumo = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { month } = req.query;
      const resumo = await this.service.getResumoMensal(month as string);
      res.json(resumo);
    } catch (error) {
      next(error);
    }
  };

  getTotais = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const totais = await this.service.getTotaisAcumulados();
      res.json(totais);
    } catch (error) {
      next(error);
    }
  };

  getLucros = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { month } = req.query;
      const lucros = await this.service.calcularLucros(month as string);
      res.json(lucros);
    } catch (error) {
      next(error);
    }
  };

  getSeries = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const series = await this.service.getSerieMensal();
      res.json(series);
    } catch (error) {
      next(error);
    }
  };

  getProductSales = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { scope = 'month', order = 'desc', limit = '10', year, month } = req.query;
      
      const sales = await this.service.getProductSales({
        scope: scope as 'month' | 'year',
        order: order as 'desc' | 'asc',
        limit: parseInt(limit as string),
        year: year as string,
        month: month as string
      });
      
      res.json(sales);
    } catch (error) {
      next(error);
    }
  };

  getDashboard = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { month } = req.query;
      const dashboard = await this.service.getDashboardData(month as string);
      res.json(dashboard);
    } catch (error) {
      next(error);
    }
  };
}