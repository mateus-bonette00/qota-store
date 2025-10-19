import { Request, Response } from 'express';
import { receitasService } from '../services/receitas.service';

export class ReceitasController {
  /**
   * GET /api/receitas
   */
  async list(req: Request, res: Response) {
    try {
      const filters = {
        mes: req.query.mes as string,
        origem: req.query.origem as string,
        produto_id: req.query.produto_id ? Number(req.query.produto_id) : undefined,
        sku: req.query.sku as string,
        dataInicio: req.query.dataInicio as string,
        dataFim: req.query.dataFim as string
      };

      const receitas = await receitasService.list(filters);
      res.json(receitas);
    } catch (error) {
      console.error('Erro ao listar receitas:', error);
      res.status(500).json({ error: 'Erro ao listar receitas' });
    }
  }

  /**
   * GET /api/receitas/:id
   */
  async findById(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      const receita = await receitasService.findById(id);

      if (!receita) {
        return res.status(404).json({ error: 'Receita não encontrada' });
      }

      res.json(receita);
    } catch (error) {
      console.error('Erro ao buscar receita:', error);
      res.status(500).json({ error: 'Erro ao buscar receita' });
    }
  }

  /**
   * POST /api/receitas
   */
  async create(req: Request, res: Response) {
    try {
      const receita = await receitasService.create(req.body);
      res.status(201).json(receita);
    } catch (error) {
      console.error('Erro ao criar receita:', error);
      res.status(500).json({ error: 'Erro ao criar receita' });
    }
  }

  /**
   * PUT /api/receitas/:id
   */
  async update(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      const receita = await receitasService.update(id, req.body);

      if (!receita) {
        return res.status(404).json({ error: 'Receita não encontrada' });
      }

      res.json(receita);
    } catch (error) {
      console.error('Erro ao atualizar receita:', error);
      res.status(500).json({ error: 'Erro ao atualizar receita' });
    }
  }

  /**
   * DELETE /api/receitas/:id
   */
  async delete(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      const success = await receitasService.delete(id);

      if (!success) {
        return res.status(404).json({ error: 'Receita não encontrada' });
      }

      res.status(204).send();
    } catch (error) {
      console.error('Erro ao deletar receita:', error);
      res.status(500).json({ error: 'Erro ao deletar receita' });
    }
  }

  /**
   * GET /api/receitas/summary
   */
  async getSummary(req: Request, res: Response) {
    try {
      const filters = {
        mes: req.query.mes as string,
        origem: req.query.origem as string
      };

      const summary = await receitasService.getSummary(filters);
      res.json(summary);
    } catch (error) {
      console.error('Erro ao obter resumo de receitas:', error);
      res.status(500).json({ error: 'Erro ao obter resumo de receitas' });
    }
  }

  /**
   * GET /api/receitas/por-produto
   */
  async getReceitasPorProduto(req: Request, res: Response) {
    try {
      const filters = {
        mes: req.query.mes as string
      };

      const receitas = await receitasService.getReceitasPorProduto(filters);
      res.json(receitas);
    } catch (error) {
      console.error('Erro ao obter receitas por produto:', error);
      res.status(500).json({ error: 'Erro ao obter receitas por produto' });
    }
  }
}

export const receitasController = new ReceitasController();