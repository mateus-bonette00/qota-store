import { Request, Response } from 'express';
import senhasService from '../services/senhas.service';

export class SenhasController {
  async list(req: Request, res: Response): Promise<void> {
    try {
      const senhas = await senhasService.list();
      res.status(200).json(senhas);
    } catch (err) {
      console.error('[senhas.list]', err);
      res.status(500).json({ error: 'Erro ao listar senhas' });
    }
  }

  async getById(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const senha = await senhasService.getById(id);

      if (!senha) {
        res.status(404).json({ error: 'Senha não encontrada' });
        return;
      }

      res.status(200).json(senha);
    } catch (err) {
      console.error('[senhas.getById]', err);
      res.status(500).json({ error: 'Erro ao buscar senha' });
    }
  }

  async create(req: Request, res: Response): Promise<void> {
    try {
      const senha = await senhasService.create(req.body);
      res.status(201).json(senha);
    } catch (err) {
      console.error('[senhas.create]', err);
      res.status(500).json({ error: 'Erro ao criar senha' });
    }
  }

  async update(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const senha = await senhasService.update(id, req.body);
      res.status(200).json(senha);
    } catch (err) {
      console.error('[senhas.update]', err);
      res.status(500).json({ error: 'Erro ao atualizar senha' });
    }
  }

  async delete(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      await senhasService.delete(id);
      res.status(204).send();
    } catch (err) {
      console.error('[senhas.delete]', err);
      res.status(500).json({ error: 'Erro ao deletar senha' });
    }
  }
}

export const senhasController = new SenhasController();
