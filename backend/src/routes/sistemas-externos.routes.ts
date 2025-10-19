import { Router } from 'express';
import { sistemasExternosController } from '../controllers/sistemas-externos.controller';

const router = Router();

router.get('/', (req, res) => sistemasExternosController.getAll(req, res));
router.get('/:id', (req, res) => sistemasExternosController.getById(req, res));
router.post('/', (req, res) => sistemasExternosController.create(req, res));
router.put('/:id', (req, res) => sistemasExternosController.update(req, res));
router.delete('/:id', (req, res) => sistemasExternosController.delete(req, res));

export default router;
