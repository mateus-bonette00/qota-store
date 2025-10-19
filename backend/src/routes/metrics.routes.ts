import { Router } from 'express';
import { MetricsController } from '../controllers/metrics.controller';

const router = Router();
const controller = new MetricsController();

router.get('/resumo', controller.getResumo);
router.get('/totais', controller.getTotais);
router.get('/lucros', controller.getLucros);
router.get('/series', controller.getSeries);
router.get('/products/sales', controller.getProductSales);
router.get('/dashboard', controller.getDashboard);

export default router;