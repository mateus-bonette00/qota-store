import { Request, Response } from "express";
import { receitasService } from "../services/receitas.service"; // ajuste o caminho se necessário

export class ReceitasController {
  // GET /receitas
  // GET /receitas
  async list(req: Request, res: Response): Promise<void> {
    try {
      const { mes, origem, produto_id, sku } = req.query;

      const result = await receitasService.list({
        mes: mes as string | undefined,
        origem: origem as string | undefined,
        produto_id: produto_id ? Number(produto_id) : undefined,
        sku: sku as string | undefined,
      });

      res.status(200).json(result);
      return;
    } catch (err) {
      console.error("[receitas.list]", err);
      res.status(500).json({ error: "Erro ao listar receitas" });
      return;
    }
  }

  // GET /receitas/summary
  async getSummary(req: Request, res: Response): Promise<void> {
    try {
      const { mes, origem, produto_id } = req.query;

      const summary = await receitasService.getSummary({
        mes: mes as string | undefined,
        origem: origem as string | undefined,
        produto_id: produto_id ? Number(produto_id) : undefined,
      });

      res.status(200).json(summary);
      return;
    } catch (err) {
      console.error("[receitas.getSummary]", err);
      res.status(500).json({ error: "Erro ao obter resumo de receitas" });
      return;
    }
  }

 // GET /receitas/por-produto
async getReceitasPorProduto(req: Request, res: Response): Promise<void> {
  try {
    const { mes, from, to } = req.query;

    const data = await receitasService.getReceitasPorProduto({
      mes: mes as string | undefined,
      from: from as string | undefined,
      to: to as string | undefined,
    });

    res.status(200).json(data);
    return;
  } catch (err) {
    console.error('[receitas.getReceitasPorProduto]', err);
    res.status(500).json({ error: 'Erro ao agrupar receitas por produto' });
    return;
  }
}


  // POST /receitas
  async create(req: Request, res: Response): Promise<void> {
    try {
      // Se houver validação, faça aqui antes de chamar o service
      const created = await receitasService.create(req.body);
      res.status(201).json(created);
      return;
    } catch (err) {
      console.error("[receitas.create]", err);
      res.status(500).json({ error: "Erro ao criar receita" });
      return;
    }
  }

  // GET /receitas/:id
  async findById(req: Request, res: Response): Promise<void> {
    try {
      const id = Number(req.params.id);
      if (!Number.isFinite(id)) {
        res.status(400).json({ error: "id inválido" });
        return;
      }
      const receita = await receitasService.findById(id);
      if (!receita) {
        res.status(404).json({ error: "Receita não encontrada" });
        return;
      }
      res.status(200).json(receita);
      return;
    } catch (err) {
      console.error("[receitas.findById]", err);
      res.status(500).json({ error: "Erro interno ao buscar receita" });
      return;
    }
  }

  // PUT /receitas/:id
  async update(req: Request, res: Response): Promise<void> {
    try {
      const id = Number(req.params.id);
      if (!Number.isFinite(id)) {
        res.status(400).json({ error: "id inválido" });
        return;
      }
      const updated = await receitasService.update(id, req.body);
      if (!updated) {
        res.status(404).json({ error: "Receita não encontrada" });
        return;
      }
      res.status(200).json(updated);
      return;
    } catch (err) {
      console.error("[receitas.update]", err);
      res.status(500).json({ error: "Erro interno ao atualizar receita" });
      return;
    }
  }

  // DELETE /receitas/:id
  async delete(req: Request, res: Response): Promise<void> {
    try {
      const id = Number(req.params.id);
      if (!Number.isFinite(id)) {
        res.status(400).json({ error: "id inválido" });
        return;
      }
      const removed = await receitasService.delete(id);
      if (!removed) {
        res.status(404).json({ error: "Receita não encontrada" });
        return;
      }
      res.status(204).send();
      return;
    } catch (err) {
      console.error("[receitas.delete]", err);
      res.status(500).json({ error: "Erro interno ao remover receita" });
      return;
    }
  }
}

export const receitasController = new ReceitasController();
