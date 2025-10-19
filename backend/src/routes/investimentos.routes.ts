import { Router } from 'express';
import { investimentosController } from '../controllers/investimentos.controller';

const router = Router();

// GET /api/investimentos/summary  (coloque antes de "/:id")
router.get('/summary', (req, res) => investimentosController.summary(req, res));

// GET /api/investimentos
router.get('/', (req, res) => investimentosController.list(req, res));

// GET /api/investimentos/:id
router.get('/:id', (req, res) => investimentosController.findById(req, res));

// POST /api/investimentos
router.post('/', (req, res) => investimentosController.create(req, res));

// PUT /api/investimentos/:id
router.put('/:id', (req, res) => investimentosController.update(req, res));

// DELETE /api/investimentos/:id
router.delete('/:id', (req, res) => investimentosController.delete(req, res));

export default router;
