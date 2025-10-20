import { Router } from 'express';
import { senhasFornecedoresController } from '../controllers/senhas-fornecedores.controller';

const router = Router();

router.get('/', (req, res) => senhasFornecedoresController.list(req, res));
router.get('/:id', (req, res) => senhasFornecedoresController.getById(req, res));
router.post('/', (req, res) => senhasFornecedoresController.create(req, res));
router.put('/:id', (req, res) => senhasFornecedoresController.update(req, res));
router.delete('/:id', (req, res) => senhasFornecedoresController.delete(req, res));

export default router;
