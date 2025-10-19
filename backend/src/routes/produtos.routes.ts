import { Router } from 'express';
import { produtosController } from '../controllers/produtos.controller';

const router = Router();

// GET /api/produtos/kanban - Get Kanban board data
router.get('/kanban', (req, res) => produtosController.getKanbanData(req, res));

// GET /api/produtos/dashboard - Get dashboard data
router.get('/dashboard', (req, res) => produtosController.getDashboard(req, res));

// GET /api/produtos/sku/:sku - Find by SKU
router.get('/sku/:sku', (req, res) => produtosController.findBySKU(req, res));

// GET /api/produtos/asin/:asin - Find by ASIN
router.get('/asin/:asin', (req, res) => produtosController.findByASIN(req, res));

// GET /api/produtos - List all produtos
router.get('/', (req, res) => produtosController.list(req, res));

// GET /api/produtos/:id - Get single produto
router.get('/:id', (req, res) => produtosController.findById(req, res));

// POST /api/produtos - Create new produto
router.post('/', (req, res) => produtosController.create(req, res));

// PUT /api/produtos/:id - Update produto
router.put('/:id', (req, res) => produtosController.update(req, res));

// PATCH /api/produtos/:id/status - Update produto status (Kanban)
router.patch('/:id/status', (req, res) => produtosController.updateStatus(req, res));

// DELETE /api/produtos/:id - Delete produto
router.delete('/:id', (req, res) => produtosController.delete(req, res));

export default router;