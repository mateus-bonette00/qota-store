import { Router } from 'express';
import gastosRoutes from './gastos.routes';
import receitasRoutes from './receitas.routes';
import produtosRoutes from './produtos.routes';
import investimentosRoutes from './investimentos.routes';
import amazonRoutes from './amazon.routes';
import metricsRoutes from './metrics.routes';
import currencyRoutes from './currency.routes';
import fornecedoresRoutes from './fornecedores.routes';
import companyInfoRoutes from './company-info.routes';
import sistemasExternosRoutes from './sistemas-externos.routes';

const router = Router();

router.use('/gastos', gastosRoutes);
router.use('/receitas', receitasRoutes);
router.use('/produtos', produtosRoutes);
router.use('/investimentos', investimentosRoutes);
router.use('/amazon', amazonRoutes);
router.use('/metrics', metricsRoutes);
router.use('/currency', currencyRoutes);
router.use('/fornecedores', fornecedoresRoutes);
router.use('/company-info', companyInfoRoutes);
router.use('/sistemas-externos', sistemasExternosRoutes);

export default router;