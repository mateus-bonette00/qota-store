import { Router } from 'express';
import { senhasController } from '../controllers/senhas.controller';

const router = Router();

router.get('/', (req, res) => senhasController.list(req, res));
router.get('/:id', (req, res) => senhasController.getById(req, res));
router.post('/', (req, res) => senhasController.create(req, res));
router.put('/:id', (req, res) => senhasController.update(req, res));
router.delete('/:id', (req, res) => senhasController.delete(req, res));

export default router;
