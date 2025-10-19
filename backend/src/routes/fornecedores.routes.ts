import { Router } from 'express';
import { fornecedoresController } from '../controllers/fornecedores.controller';

const router = Router();

router.get('/', (req, res) => fornecedoresController.getAll(req, res));
router.get('/:id', (req, res) => fornecedoresController.getById(req, res));
router.post('/', (req, res) => fornecedoresController.create(req, res));
router.put('/:id', (req, res) => fornecedoresController.update(req, res));
router.delete('/:id', (req, res) => fornecedoresController.delete(req, res));

export default router;
