import { Router } from 'express';
import { RoutesController } from '../controllers/RoutesController';
import { ComplianceController } from '../controllers/ComplianceController';
import { BankingController } from '../controllers/BankingController';
import { PoolingController } from '../controllers/PoolingController';

export function createRouter(
  routesController: RoutesController,
  complianceController: ComplianceController,
  bankingController: BankingController,
  poolingController: PoolingController
): Router {
  const router = Router();

  // Routes endpoints
  router.get('/routes', routesController.getAllRoutes);
  router.post('/routes/:routeId/baseline', routesController.setBaseline);
  router.get('/routes/comparison', routesController.getComparison);

  // Compliance endpoints
  router.get('/compliance/cb', complianceController.getComplianceBalance);
  router.get('/compliance/adjusted-cb', complianceController.getAdjustedCompliance);

  // Banking endpoints
  router.get('/banking/records', bankingController.getBankingRecords);
  router.get('/banking/balance', bankingController.getAvailableBalance);
  router.post('/banking/bank', bankingController.bankSurplus);
  router.post('/banking/apply', bankingController.applyBanked);

  // Pooling endpoints
  router.post('/pools', poolingController.createPool);
  router.post('/pools/validate', poolingController.validatePool);

  return router;
}
