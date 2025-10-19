import { Request, Response, NextFunction } from 'express';
import { GastosService } from '../services/gastos.service';

export class GastosController {
  private service: GastosService;

  constructor() {
    this.service = new GastosService();
  }

  // GET /api/gastos?month=YYYY-MM
  getAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { month } = req.query;
      const gastos = await this.service.findAll(month as string | undefined);
      return void res.json(gastos);
    } catch (error) {
      return void next(error);
    }
  };

  // GET /api/gastos/:id
  getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = Number(req.params.id);
      if (Number.isNaN(id)) {
        return void res.status(400).json({ error: 'Parâmetro id inválido' });
      }

      const gasto = await this.service.findById(id);
      if (!gasto) {
        return void res.status(404).json({ error: 'Gasto não encontrado' });
      }

      return void res.json(gasto);
    } catch (error) {
      return void next(error);
    }
  };

  // POST /api/gastos
  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const gasto = await this.service.create(req.body);
      return void res.status(201).json(gasto);
    } catch (error) {
      return void next(error);
    }
  };

  // PUT /api/gastos/:id
  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = Number(req.params.id);
      if (Number.isNaN(id)) {
        return void res.status(400).json({ error: 'Parâmetro id inválido' });
      }

      const gasto = await this.service.update(id, req.body);
      if (!gasto) {
        return void res.status(404).json({ error: 'Gasto não encontrado' });
      }

      return void res.json(gasto);
    } catch (error) {
      return void next(error);
    }
  };

  // DELETE /api/gastos/:id
  delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = Number(req.params.id);
      if (Number.isNaN(id)) {
        return void res.status(400).json({ error: 'Parâmetro id inválido' });
      }

      const deleted = await this.service.delete(id);
      if (!deleted) {
        return void res.status(404).json({ error: 'Gasto não encontrado' });
      }

      // 204 No Content
      return void res.sendStatus(204);
    } catch (error) {
      return void next(error);
    }
  };
}

export const gastosController = new GastosController();
