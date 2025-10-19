import { Request, Response } from 'express';
import fornecedoresService from '../services/fornecedores.service';

export class FornecedoresController {
  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const { search } = req.query;

      let result;
      if (search) {
        result = await fornecedoresService.search(search as string);
      } else {
        result = await fornecedoresService.getAll();
      }

      res.status(200).json(result);
    } catch (err) {
      console.error('[fornecedores.getAll]', err);
      res.status(500).json({ error: 'Erro ao listar fornecedores' });
    }
  }

  async getById(req: Request, res: Response): Promise<void> {
    try {
      const id = Number(req.params.id);
      if (!Number.isFinite(id)) {
        res.status(400).json({ error: 'ID inválido' });
        return;
      }

      const fornecedor = await fornecedoresService.getById(id);
      if (!fornecedor) {
        res.status(404).json({ error: 'Fornecedor não encontrado' });
        return;
      }

      res.status(200).json(fornecedor);
    } catch (err) {
      console.error('[fornecedores.getById]', err);
      res.status(500).json({ error: 'Erro ao buscar fornecedor' });
    }
  }

  async create(req: Request, res: Response): Promise<void> {
    try {
      const created = await fornecedoresService.create(req.body);
      res.status(201).json(created);
    } catch (err) {
      console.error('[fornecedores.create]', err);
      res.status(500).json({ error: 'Erro ao criar fornecedor' });
    }
  }

  async update(req: Request, res: Response): Promise<void> {
    try {
      const id = Number(req.params.id);
      if (!Number.isFinite(id)) {
        res.status(400).json({ error: 'ID inválido' });
        return;
      }

      const updated = await fornecedoresService.update(id, req.body);
      if (!updated) {
        res.status(404).json({ error: 'Fornecedor não encontrado' });
        return;
      }

      res.status(200).json(updated);
    } catch (err) {
      console.error('[fornecedores.update]', err);
      res.status(500).json({ error: 'Erro ao atualizar fornecedor' });
    }
  }

  async delete(req: Request, res: Response): Promise<void> {
    try {
      const id = Number(req.params.id);
      if (!Number.isFinite(id)) {
        res.status(400).json({ error: 'ID inválido' });
        return;
      }

      const removed = await fornecedoresService.delete(id);
      if (!removed) {
        res.status(404).json({ error: 'Fornecedor não encontrado' });
        return;
      }

      res.status(204).send();
    } catch (err) {
      console.error('[fornecedores.delete]', err);
      res.status(500).json({ error: 'Erro ao deletar fornecedor' });
    }
  }
}

export const fornecedoresController = new FornecedoresController();
