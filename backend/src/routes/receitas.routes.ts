import { Router } from 'express';
import { receitasController } from '../controllers/receitas.controller';

const router = Router();

// GET /api/receitas - List all receitas
router.get('/', (req, res) => receitasController.list(req, res));

// GET /api/receitas/summary - Get summary
router.get('/summary', (req, res) => receitasController.getSummary(req, res));

// GET /api/receitas/por-produto - Get receitas grouped by product
router.get('/por-produto', (req, res) => receitasController.getReceitasPorProduto(req, res));

// GET /api/receitas/:id - Get single receita
router.get('/:id', (req, res) => receitasController.findById(req, res));

// POST /api/receitas - Create new receita
router.post('/', (req, res) => receitasController.create(req, res));

// PUT /api/receitas/:id - Update receita
router.put('/:id', (req, res) => receitasController.update(req, res));

// DELETE /api/receitas/:id - Delete receita
router.delete('/:id', (req, res) => receitasController.delete(req, res));

export default router;