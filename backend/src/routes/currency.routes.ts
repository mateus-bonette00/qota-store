import { Router } from 'express';
import { CurrencyController } from '../controllers/currency.controller';

const router = Router();
const controller = new CurrencyController();

router.get('/rates', controller.getRates);
router.post('/convert', controller.convert);

export default router;