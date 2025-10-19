import { Request, Response } from 'express';
import { produtosService } from '../services/produtos.service';
import { ProdutoStatus } from '../models/produto.model'; // ProdutoStatus é um *type* ('ATIVO' | 'INATIVO')

export class ProdutosController {
  // GET /produtos
  async list(req: Request, res: Response): Promise<void> {
    try {
      // O service NÃO aceita "q"; envie apenas o que ele conhece.
      const { status, categoria, sku, asin, ativo } = req.query;

      // Mapear ativo:boolean-like -> ProdutoStatus (type)
      const statusFromAtivo: ProdutoStatus | undefined =
        ativo !== undefined
          ? (String(ativo) === 'true' ? ('ATIVO' as ProdutoStatus) : ('INATIVO' as ProdutoStatus))
          : undefined;

      const result = await produtosService.list({
        // priorize 'status' explícito; senão, use o derivado de 'ativo'
        status: (status as ProdutoStatus) ?? statusFromAtivo,
        categoria: (categoria as string) || undefined,
        sku: (sku as string) || undefined,
        asin: (asin as string) || undefined,
      });

      res.status(200).json(result);
      return;
    } catch (err) {
      console.error('[produtos.list]', err);
      res.status(500).json({ error: 'Erro ao listar produtos' });
      return;
    }
  }

  // POST /produtos
  async create(req: Request, res: Response): Promise<void> {
    try {
      const created = await produtosService.create(req.body);
      res.status(201).json(created);
      return;
    } catch (err) {
      console.error('[produtos.create]', err);
      res.status(500).json({ error: 'Erro ao criar produto' });
      return;
    }
  }

  // GET /produtos/:id
  async findById(req: Request, res: Response): Promise<void> {
    try {
      const id = Number(req.params.id);
      if (!Number.isFinite(id)) {
        res.status(400).json({ error: 'id inválido' });
        return;
      }

      const produto = await produtosService.findById(id);
      if (!produto) {
        res.status(404).json({ error: 'Produto não encontrado' });
        return;
      }

      res.status(200).json(produto);
      return;
    } catch (err) {
      console.error('[produtos.findById]', err);
      res.status(500).json({ error: 'Erro interno ao buscar produto' });
      return;
    }
  }

  // PUT /produtos/:id
  async update(req: Request, res: Response): Promise<void> {
    try {
      const id = Number(req.params.id);
      if (!Number.isFinite(id)) {
        res.status(400).json({ error: 'id inválido' });
        return;
      }

      const updated = await produtosService.update(id, req.body);
      if (!updated) {
        res.status(404).json({ error: 'Produto não encontrado' });
        return;
      }

      res.status(200).json(updated);
      return;
    } catch (err) {
      console.error('[produtos.update]', err);
      res.status(500).json({ error: 'Erro interno ao atualizar produto' });
      return;
    }
  }

  // PATCH /produtos/:id/status
  async updateStatus(req: Request, res: Response): Promise<void> {
    try {
      const id = Number(req.params.id);
      if (!Number.isFinite(id)) {
        res.status(400).json({ error: 'id inválido' });
        return;
      }

      const { ativo } = req.body as { ativo?: boolean };
      if (typeof ativo !== 'boolean') {
        res.status(400).json({ error: 'Campo "ativo" é obrigatório e deve ser boolean' });
        return;
      }

      // ProdutoStatus é *type*; use strings com assertion
      const novoStatus: ProdutoStatus = (ativo ? 'ATIVO' : 'INATIVO') as ProdutoStatus;

      const updated = await produtosService.updateStatus(id, novoStatus);
      if (!updated) {
        res.status(404).json({ error: 'Produto não encontrado' });
        return;
      }

      res.status(200).json(updated);
      return;
    } catch (err) {
      console.error('[produtos.updateStatus]', err);
      res.status(500).json({ error: 'Erro ao atualizar status do produto' });
      return;
    }
  }

  // DELETE /produtos/:id
  async delete(req: Request, res: Response): Promise<void> {
    try {
      const id = Number(req.params.id);
      if (!Number.isFinite(id)) {
        res.status(400).json({ error: 'id inválido' });
        return;
      }

      const removed = await produtosService.delete(id);
      if (!removed) {
        res.status(404).json({ error: 'Produto não encontrado' });
        return;
      }

      res.status(204).send();
      return;
    } catch (err) {
      console.error('[produtos.delete]', err);
      res.status(500).json({ error: 'Erro ao remover produto' });
      return;
    }
  }

  // GET /produtos/sku/:sku
  async findBySKU(req: Request, res: Response): Promise<void> {
    try {
      const { sku } = req.params;
      if (!sku) {
        res.status(400).json({ error: 'sku é obrigatório' });
        return;
      }

      const produto = await produtosService.findBySKU(sku);
      if (!produto) {
        res.status(404).json({ error: 'Produto não encontrado' });
        return;
      }

      res.status(200).json(produto);
      return;
    } catch (err) {
      console.error('[produtos.findBySKU]', err);
      res.status(500).json({ error: 'Erro ao buscar por SKU' });
      return;
    }
  }

  // GET /produtos/asin/:asin
  async findByASIN(req: Request, res: Response): Promise<void> {
    try {
      const { asin } = req.params;
      if (!asin) {
        res.status(400).json({ error: 'asin é obrigatório' });
        return;
      }

      const produto = await produtosService.findByASIN(asin);
      if (!produto) {
        res.status(404).json({ error: 'Produto não encontrado' });
        return;
      }

      res.status(200).json(produto);
      return;
    } catch (err) {
      console.error('[produtos.findByASIN]', err);
      res.status(500).json({ error: 'Erro ao buscar por ASIN' });
      return;
    }
  }

  // GET /produtos/kanban
  async getKanbanData(req: Request, res: Response): Promise<void> {
    try {
      const { categoria } = req.query;
      const data = await produtosService.getKanbanData({
        categoria: (categoria as string) || undefined,
      });
      res.status(200).json(data);
      return;
    } catch (err) {
      console.error('[produtos.getKanbanData]', err);
      res.status(500).json({ error: 'Erro ao carregar dados do Kanban' });
      return;
    }
  }

  // GET /produtos/dashboard
  async getDashboard(req: Request, res: Response): Promise<void> {
    try {
      const { mes, from, to } = req.query as {
        mes?: string; from?: string; to?: string;
      };

      const data = await produtosService.getDashboard({ mes, from, to });
      res.status(200).json(data);
      return;
    } catch (err) {
      console.error('[produtos.getDashboard]', err);
      res.status(500).json({ error: 'Erro ao carregar dados do dashboard' });
      return;
    }
  }


}

export const produtosController = new ProdutosController();
