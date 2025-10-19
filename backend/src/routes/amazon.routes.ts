import { Router } from 'express';
import { amazonController } from '../controllers/amazon.controller';

const router = Router();

// Saldos
router.get('/saldos/latest', amazonController.getLatestSaldo);

// Sincronização
router.post('/sync/orders', amazonController.syncOrders);

// Teste de conexão
router.get('/test-connection', amazonController.testConnection);

// Receitas (rotas antigas mantidas)
router.get('/receitas', (req, res) => res.json([]));
router.post('/receitas', (req, res) => res.status(201).json(req.body));
router.delete('/receitas/:id', (req, res) => res.status(204).send());

export default router;