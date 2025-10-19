import { Request, Response } from 'express';
import { investimentosService } from '../services/investimentos.service';

export class InvestimentosController {
  /**
   * GET /api/investimentos
   */
  async list(req: Request, res: Response) {
    try {
      const filters = {
        mes: req.query.mes as string
      };

      const investimentos = await investimentosService.list(filters);
      res.json(investimentos);
    } catch (error) {
      console.error('Erro ao listar investimentos:', error);
      res.status(500).json({ error: 'Erro ao listar investimentos' });
    }
  }

  /**
   * GET /api/investimentos/:id
   */
  async findById(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      const investimento = await investimentosService.findById(id);

      if (!investimento) {
        return res.status(404).json({ error: 'Investimento não encontrado' });
      }

      res.json(investimento);
    } catch (error) {
      console.error('Erro ao buscar investimento:', error);
      res.status(500).json({ error: 'Erro ao buscar investimento' });
    }
  }

  /**
   * POST /api/investimentos
   */
  async create(req: Request, res: Response) {
    try {
      const investimento = await investimentosService.create(req.body);
      res.status(201).json(investimento);
    } catch (error) {
      console.error('Erro ao criar investimento:', error);
      res.status(500).json({ error: 'Erro ao criar investimento' });
    }
  }

  /**
   * PUT /api/investimentos/:id
   */
  async update(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      const investimento = await investimentosService.update(id, req.body);

      if (!investimento) {
        return res.status(404).json({ error: 'Investimento não encontrado' });
      }

      res.json(investimento);
    } catch (error) {
      console.error('Erro ao atualizar investimento:', error);
      res.status(500).json({ error: 'Erro ao atualizar investimento' });
    }
  }

  /**
   * DELETE /api/investimentos/:id
   */
  async delete(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      const success = await investimentosService.delete(id);

      if (!success) {
        return res.status(404).json({ error: 'Investimento não encontrado' });
      }

      res.status(204).send();
    } catch (error) {
      console.error('Erro ao deletar investimento:', error);
      res.status(500).json({ error: 'Erro ao deletar investimento' });
    }
  }

  /**
   * GET /api/investimentos/summary
   */
  async getSummary(req: Request, res: Response) {
    try {
      const summary = await investimentosService.getSummary();
      res.json(summary);
    } catch (error) {
      console.error('Erro ao obter resumo de investimentos:', error);
      res.status(500).json({ error: 'Erro ao obter resumo de investimentos' });
    }
  }
}

export const investimentosController = new InvestimentosController();