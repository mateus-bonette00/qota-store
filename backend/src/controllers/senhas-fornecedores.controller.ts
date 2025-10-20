import { Request, Response } from 'express';
import senhasFornecedoresService from '../services/senhas-fornecedores.service';

export class SenhasFornecedoresController {
  async list(req: Request, res: Response): Promise<void> {
    try {
      const senhas = await senhasFornecedoresService.list();
      res.status(200).json(senhas);
    } catch (err) {
      console.error('[senhasFornecedores.list]', err);
      res.status(500).json({ error: 'Erro ao listar senhas de fornecedores' });
    }
  }

  async getById(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const senha = await senhasFornecedoresService.getById(id);

      if (!senha) {
        res.status(404).json({ error: 'Senha de fornecedor não encontrada' });
        return;
      }

      res.status(200).json(senha);
    } catch (err) {
      console.error('[senhasFornecedores.getById]', err);
      res.status(500).json({ error: 'Erro ao buscar senha de fornecedor' });
    }
  }

  async create(req: Request, res: Response): Promise<void> {
    try {
      const senha = await senhasFornecedoresService.create(req.body);
      res.status(201).json(senha);
    } catch (err) {
      console.error('[senhasFornecedores.create]', err);
      res.status(500).json({ error: 'Erro ao criar senha de fornecedor' });
    }
  }

  async update(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const senha = await senhasFornecedoresService.update(id, req.body);
      res.status(200).json(senha);
    } catch (err) {
      console.error('[senhasFornecedores.update]', err);
      res.status(500).json({ error: 'Erro ao atualizar senha de fornecedor' });
    }
  }

  async delete(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      await senhasFornecedoresService.delete(id);
      res.status(204).send();
    } catch (err) {
      console.error('[senhasFornecedores.delete]', err);
      res.status(500).json({ error: 'Erro ao deletar senha de fornecedor' });
    }
  }
}

export const senhasFornecedoresController = new SenhasFornecedoresController();
