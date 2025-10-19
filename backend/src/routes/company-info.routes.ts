import { Router } from 'express';
import { companyInfoController } from '../controllers/company-info.controller';

const router = Router();

router.get('/', (req, res) => companyInfoController.get(req, res));
router.post('/', (req, res) => companyInfoController.createOrUpdate(req, res));
router.put('/', (req, res) => companyInfoController.createOrUpdate(req, res));

export default router;
