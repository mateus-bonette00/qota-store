import { Router } from 'express';
import gastosRoutes from './gastos.routes';
import receitasRoutes from './receitas.routes';  // NOVO
import produtosRoutes from './produtos.routes';  // NOVO
import investimentosRoutes from './investimentos.routes';  // NOVO
import amazonRoutes from './amazon.routes';
import metricsRoutes from './metrics.routes';
import currencyRoutes from './currency.routes';

const router = Router();

router.use('/gastos', gastosRoutes);
router.use('/receitas', receitasRoutes);  // NOVO
router.use('/produtos', produtosRoutes);  // NOVO
router.use('/investimentos', investimentosRoutes);  // NOVO
router.use('/amazon', amazonRoutes);
router.use('/metrics', metricsRoutes);
router.use('/currency', currencyRoutes);

export default router;