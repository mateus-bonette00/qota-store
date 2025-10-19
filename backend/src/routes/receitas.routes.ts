import { Router } from 'express';
import { receitasController } from '../controllers/receitas.controller';

const router = Router();

// Se preferir evitar problemas de 'this', mantenha como arrow:
router.get('/',           (req, res) => receitasController.list(req, res));
router.get('/summary',    (req, res) => receitasController.getSummary(req, res));
router.get('/por-produto',(req, res) => receitasController.getReceitasPorProduto(req, res));
router.post('/',          (req, res) => receitasController.create(req, res));
router.get('/:id',        (req, res) => receitasController.findById(req, res));
router.put('/:id',        (req, res) => receitasController.update(req, res));
router.delete('/:id',     (req, res) => receitasController.delete(req, res));

export default router;
