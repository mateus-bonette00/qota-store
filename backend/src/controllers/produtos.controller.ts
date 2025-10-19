import { Request, Response } from 'express';
import { produtosService } from '../services/produtos.service';
import { ProdutoStatus } from '../models/produto.model';

export class ProdutosController {
  /**
   * GET /api/produtos
   */
  async list(req: Request, res: Response) {
    try {
      const filters = {
        status: req.query.status as ProdutoStatus,
        categoria: req.query.categoria as string,
        sku: req.query.sku as string,
        asin: req.query.asin as string,
        fornecedor: req.query.fornecedor as string
      };

      const produtos = await produtosService.list(filters);
      res.json(produtos);
    } catch (error) {
      console.error('Erro ao listar produtos:', error);
      res.status(500).json({ error: 'Erro ao listar produtos' });
    }
  }

  /**
   * GET /api/produtos/:id
   */
  async findById(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      const withMetrics = req.query.metrics === 'true';
      const produto = await produtosService.findById(id, withMetrics);

      if (!produto) {
        return res.status(404).json({ error: 'Produto não encontrado' });
      }

      res.json(produto);
    } catch (error) {
      console.error('Erro ao buscar produto:', error);
      res.status(500).json({ error: 'Erro ao buscar produto' });
    }
  }

  /**
   * POST /api/produtos
   */
  async create(req: Request, res: Response) {
    try {
      const produto = await produtosService.create(req.body);
      res.status(201).json(produto);
    } catch (error) {
      console.error('Erro ao criar produto:', error);
      res.status(500).json({ error: 'Erro ao criar produto' });
    }
  }

  /**
   * PUT /api/produtos/:id
   */
  async update(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      const produto = await produtosService.update(id, req.body);

      if (!produto) {
        return res.status(404).json({ error: 'Produto não encontrado' });
      }

      res.json(produto);
    } catch (error) {
      console.error('Erro ao atualizar produto:', error);
      res.status(500).json({ error: 'Erro ao atualizar produto' });
    }
  }

  /**
   * PATCH /api/produtos/:id/status
   */
  async updateStatus(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      const { status } = req.body;

      if (!status) {
        return res.status(400).json({ error: 'Status é obrigatório' });
      }

      const produto = await produtosService.updateStatus(id, status);

      if (!produto) {
        return res.status(404).json({ error: 'Produto não encontrado' });
      }

      res.json(produto);
    } catch (error) {
      console.error('Erro ao atualizar status do produto:', error);
      res.status(500).json({ error: 'Erro ao atualizar status do produto' });
    }
  }

  /**
   * DELETE /api/produtos/:id
   */
  async delete(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      const success = await produtosService.delete(id);

      if (!success) {
        return res.status(404).json({ error: 'Produto não encontrado' });
      }

      res.status(204).send();
    } catch (error) {
      console.error('Erro ao deletar produto:', error);
      res.status(500).json({ error: 'Erro ao deletar produto' });
    }
  }

  /**
   * GET /api/produtos/kanban
   */
  async getKanbanData(req: Request, res: Response) {
    try {
      const kanbanData = await produtosService.getKanbanData();
      res.json(kanbanData);
    } catch (error) {
      console.error('Erro ao obter dados do Kanban:', error);
      res.status(500).json({ error: 'Erro ao obter dados do Kanban' });
    }
  }

  /**
   * GET /api/produtos/dashboard
   */
  async getDashboard(req: Request, res: Response) {
    try {
      const dashboard = await produtosService.getDashboard();
      res.json(dashboard);
    } catch (error) {
      console.error('Erro ao obter dashboard de produtos:', error);
      res.status(500).json({ error: 'Erro ao obter dashboard de produtos' });
    }
  }

  /**
   * GET /api/produtos/sku/:sku
   */
  async findBySKU(req: Request, res: Response) {
    try {
      const sku = req.params.sku;
      const produto = await produtosService.findBySKU(sku);

      if (!produto) {
        return res.status(404).json({ error: 'Produto não encontrado' });
      }

      res.json(produto);
    } catch (error) {
      console.error('Erro ao buscar produto por SKU:', error);
      res.status(500).json({ error: 'Erro ao buscar produto por SKU' });
    }
  }

  /**
   * GET /api/produtos/asin/:asin
   */
  async findByASIN(req: Request, res: Response) {
    try {
      const asin = req.params.asin;
      const produto = await produtosService.findByASIN(asin);

      if (!produto) {
        return res.status(404).json({ error: 'Produto não encontrado' });
      }

      res.json(produto);
    } catch (error) {
      console.error('Erro ao buscar produto por ASIN:', error);
      res.status(500).json({ error: 'Erro ao buscar produto por ASIN' });
    }
  }
}

export const produtosController = new ProdutosController();