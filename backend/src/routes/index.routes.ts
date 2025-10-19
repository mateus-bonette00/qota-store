import { Router } from 'express';
import gastosRoutes from './gastos.routes';
import investimentosRoutes from './investimentos.routes';
import produtosRoutes from './produtos.routes';
import receitasRoutes from './receitas.routes';
import amazonRoutes from './amazon.routes';
import metricsRoutes from './metrics.routes';
import currencyRoutes from './currency.routes'; // ⭐ NOVO

const router = Router();

// Rotas principais
router.use('/gastos', gastosRoutes);
router.use('/investimentos', investimentosRoutes);
router.use('/produtos', produtosRoutes);
router.use('/receitas', receitasRoutes);
router.use('/amazon', amazonRoutes);
router.use('/metrics', metricsRoutes);
router.use('/currency', currencyRoutes); // ⭐ NOVO

// Rota de informações da API
router.get('/', (req, res) => {
  res.json({
    name: 'Qota Finance API',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      gastos: '/api/gastos',
      investimentos: '/api/investimentos',
      produtos: '/api/produtos',
      receitas: '/api/receitas',
      amazon: '/api/amazon',
      metrics: '/api/metrics',
      currency: '/api/currency' // ⭐ NOVO
    }
  });
});

export default router;