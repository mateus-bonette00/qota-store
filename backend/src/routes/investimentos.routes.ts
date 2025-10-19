import { Router } from 'express';
import { investimentosController } from '../controllers/investimentos.controller';

const router = Router();

// GET /api/investimentos/summary - Get summary
router.get('/summary', (req, res) => investimentosController.getSummary(req, res));

// GET /api/investimentos - List all investimentos
router.get('/', (req, res) => investimentosController.list(req, res));

// GET /api/investimentos/:id - Get single investimento
router.get('/:id', (req, res) => investimentosController.findById(req, res));

// POST /api/investimentos - Create new investimento
router.post('/', (req, res) => investimentosController.create(req, res));

// PUT /api/investimentos/:id - Update investimento
router.put('/:id', (req, res) => investimentosController.update(req, res));

// DELETE /api/investimentos/:id - Delete investimento
router.delete('/:id', (req, res) => investimentosController.delete(req, res));

export default router;