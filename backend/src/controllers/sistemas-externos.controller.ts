import { Request, Response } from 'express';
import sistemasExternosService from '../services/sistemas-externos.service';

export class SistemasExternosController {
  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const result = await sistemasExternosService.getAll();
      res.status(200).json(result);
    } catch (err) {
      console.error('[sistemasExternos.getAll]', err);
      res.status(500).json({ error: 'Erro ao listar sistemas externos' });
    }
  }

  async getById(req: Request, res: Response): Promise<void> {
    try {
      const id = Number(req.params.id);
      if (!Number.isFinite(id)) {
        res.status(400).json({ error: 'ID inválido' });
        return;
      }

      const sistema = await sistemasExternosService.getById(id);
      if (!sistema) {
        res.status(404).json({ error: 'Sistema externo não encontrado' });
        return;
      }

      res.status(200).json(sistema);
    } catch (err) {
      console.error('[sistemasExternos.getById]', err);
      res.status(500).json({ error: 'Erro ao buscar sistema externo' });
    }
  }

  async create(req: Request, res: Response): Promise<void> {
    try {
      const created = await sistemasExternosService.create(req.body);
      res.status(201).json(created);
    } catch (err) {
      console.error('[sistemasExternos.create]', err);
      res.status(500).json({ error: 'Erro ao criar sistema externo' });
    }
  }

  async update(req: Request, res: Response): Promise<void> {
    try {
      const id = Number(req.params.id);
      if (!Number.isFinite(id)) {
        res.status(400).json({ error: 'ID inválido' });
        return;
      }

      const updated = await sistemasExternosService.update(id, req.body);
      if (!updated) {
        res.status(404).json({ error: 'Sistema externo não encontrado' });
        return;
      }

      res.status(200).json(updated);
    } catch (err) {
      console.error('[sistemasExternos.update]', err);
      res.status(500).json({ error: 'Erro ao atualizar sistema externo' });
    }
  }

  async delete(req: Request, res: Response): Promise<void> {
    try {
      const id = Number(req.params.id);
      if (!Number.isFinite(id)) {
        res.status(400).json({ error: 'ID inválido' });
        return;
      }

      const removed = await sistemasExternosService.delete(id);
      if (!removed) {
        res.status(404).json({ error: 'Sistema externo não encontrado' });
        return;
      }

      res.status(204).send();
    } catch (err) {
      console.error('[sistemasExternos.delete]', err);
      res.status(500).json({ error: 'Erro ao deletar sistema externo' });
    }
  }
}

export const sistemasExternosController = new SistemasExternosController();
