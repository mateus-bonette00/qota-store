// src/routes/gastos.routes.ts
import { Router } from 'express';
import { gastosController } from '../controllers/gastos.controller';
import {
  validateIdParam,
  validateMonthQuery,
  validateCreateGasto,
  validateUpdateGasto,
} from '../middlewares/validation.middleware';

const router = Router();

router.get('/', validateMonthQuery, gastosController.getAll);
router.get('/:id', validateIdParam, gastosController.getById);
router.post('/', validateCreateGasto, gastosController.create);
router.put('/:id', validateIdParam, validateUpdateGasto, gastosController.update);
router.delete('/:id', validateIdParam, gastosController.delete);

export default router;
