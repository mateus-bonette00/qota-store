import { Router } from 'express';
const router = Router();

// TODO: Implementar controllers e services de receitas
router.get('/', (req, res) => res.json([]));
router.post('/', (req, res) => res.status(201).json(req.body));
router.delete('/:id', (req, res) => res.status(204).send());

export default router;