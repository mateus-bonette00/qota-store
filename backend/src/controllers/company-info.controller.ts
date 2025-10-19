import { Request, Response } from 'express';
import companyInfoService from '../services/company-info.service';

export class CompanyInfoController {
  async get(req: Request, res: Response): Promise<void> {
    try {
      const info = await companyInfoService.get();
      if (!info) {
        res.status(404).json({ error: 'Informações da empresa não encontradas' });
        return;
      }
      res.status(200).json(info);
    } catch (err) {
      console.error('[companyInfo.get]', err);
      res.status(500).json({ error: 'Erro ao buscar informações da empresa' });
    }
  }

  async createOrUpdate(req: Request, res: Response): Promise<void> {
    try {
      const result = await companyInfoService.createOrUpdate(req.body);
      res.status(200).json(result);
    } catch (err) {
      console.error('[companyInfo.createOrUpdate]', err);
      res.status(500).json({ error: 'Erro ao atualizar informações da empresa' });
    }
  }
}

export const companyInfoController = new CompanyInfoController();
