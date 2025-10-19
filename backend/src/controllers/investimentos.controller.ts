import { Request, Response } from 'express';
import { investimentosService } from '../services/investimentos.service';

export class InvestimentosController {
  /**
   * GET /api/investimentos
   */
  async list(req: Request, res: Response): Promise<void> {
    try {
      const filters = {
        mes: (req.query.mes as string) || undefined,
      };

      const investimentos = await investimentosService.list(filters);
      res.status(200).json(investimentos);
      return;
    } catch (error) {
      console.error('Erro ao listar investimentos:', error);
      res.status(500).json({ error: 'Erro ao listar investimentos' });
      return;
    }
  }

  /**
   * GET /api/investimentos/:id
   */
  async findById(req: Request, res: Response): Promise<void> {
    try {
      const id = Number(req.params.id);
      if (!Number.isFinite(id)) {
        res.status(400).json({ error: 'id inválido' });
        return;
      }

      const investimento = await investimentosService.findById(id);
      if (!investimento) {
        res.status(404).json({ error: 'Investimento não encontrado' });
        return;
      }

      res.status(200).json(investimento);
      return;
    } catch (error) {
      console.error('Erro ao buscar investimento:', error);
      res.status(500).json({ error: 'Erro ao buscar investimento' });
      return;
    }
  }

  /**
   * POST /api/investimentos
   */
  async create(req: Request, res: Response): Promise<void> {
    try {
      const created = await investimentosService.create(req.body);
      res.status(201).json(created);
      return;
    } catch (error) {
      console.error('Erro ao criar investimento:', error);
      res.status(500).json({ error: 'Erro ao criar investimento' });
      return;
    }
  }

  /**
   * PUT /api/investimentos/:id
   */
  async update(req: Request, res: Response): Promise<void> {
    try {
      const id = Number(req.params.id);
      if (!Number.isFinite(id)) {
        res.status(400).json({ error: 'id inválido' });
        return;
      }

      const investimento = await investimentosService.update(id, req.body);
      if (!investimento) {
        res.status(404).json({ error: 'Investimento não encontrado' });
        return;
      }

      res.status(200).json(investimento);
      return;
    } catch (error) {
      console.error('Erro ao atualizar investimento:', error);
      res.status(500).json({ error: 'Erro ao atualizar investimento' });
      return;
    }
  }

  /**
   * DELETE /api/investimentos/:id
   */
  async delete(req: Request, res: Response): Promise<void> {
    try {
      const id = Number(req.params.id);
      if (!Number.isFinite(id)) {
        res.status(400).json({ error: 'id inválido' });
        return;
      }

      const success = await investimentosService.delete(id);
      if (!success) {
        res.status(404).json({ error: 'Investimento não encontrado' });
        return;
      }

      res.status(204).send();
      return;
    } catch (error) {
      console.error('Erro ao deletar investimento:', error);
      res.status(500).json({ error: 'Erro ao deletar investimento' });
      return;
    }
  }

  /**
   * GET /api/investimentos/summary
   * (se existir no service)
   */
  async summary(req: Request, res: Response): Promise<void> {
    try {
      const { mes, from, to } = req.query as { mes?: string; from?: string; to?: string };
      const data = await investimentosService.summary({ mes, from, to });
      res.status(200).json(data);
      return;
    } catch (error) {
      console.error('Erro ao obter summary dos investimentos:', error);
      res.status(500).json({ error: 'Erro ao obter summary dos investimentos' });
      return;
    }
  }
}

export const investimentosController = new InvestimentosController();
