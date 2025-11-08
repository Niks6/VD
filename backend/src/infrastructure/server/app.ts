import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { PrismaClient } from '@prisma/client';

// Repositories
import { PrismaRoutesRepository } from '../../adapters/outbound/postgres/PrismaRoutesRepository';
import { PrismaComplianceRepository } from '../../adapters/outbound/postgres/PrismaComplianceRepository';
import { PrismaBankingRepository } from '../../adapters/outbound/postgres/PrismaBankingRepository';
import { PrismaPoolingRepository } from '../../adapters/outbound/postgres/PrismaPoolingRepository';

// Services
import { RoutesService } from '../../core/application/RoutesService';
import { ComplianceService } from '../../core/application/ComplianceService';
import { BankingService } from '../../core/application/BankingService';
import { PoolingService } from '../../core/application/PoolingService';

// Controllers
import { RoutesController } from '../../adapters/inbound/http/controllers/RoutesController';
import { ComplianceController } from '../../adapters/inbound/http/controllers/ComplianceController';
import { BankingController } from '../../adapters/inbound/http/controllers/BankingController';
import { PoolingController } from '../../adapters/inbound/http/controllers/PoolingController';

// Routes
import { createRouter } from '../../adapters/inbound/http/routes';

export function createApp(): Express {
  const app = express();

  // Middleware
  app.use(helmet());
  app.use(cors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:5173'],
    credentials: true,
  }));
  app.use(morgan('dev'));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Database
  const prisma = new PrismaClient();

  // Initialize repositories (Outbound adapters)
  const routesRepository = new PrismaRoutesRepository(prisma);
  const complianceRepository = new PrismaComplianceRepository(prisma);
  const bankingRepository = new PrismaBankingRepository(prisma);
  const poolingRepository = new PrismaPoolingRepository(prisma);

  // Initialize services (Application layer)
  const routesService = new RoutesService(routesRepository);
  const complianceService = new ComplianceService(
    complianceRepository,
    routesRepository,
    bankingRepository
  );
  const bankingService = new BankingService(bankingRepository, complianceRepository);
  const poolingService = new PoolingService(poolingRepository, complianceRepository);

  // Initialize controllers (Inbound adapters)
  const routesController = new RoutesController(routesService);
  const complianceController = new ComplianceController(complianceService, routesRepository);
  const bankingController = new BankingController(bankingService);
  const poolingController = new PoolingController(poolingService);

  // Health check
  app.get('/health', (req: Request, res: Response) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // API routes
  const apiRouter = createRouter(
    routesController,
    complianceController,
    bankingController,
    poolingController
  );
  app.use('/api', apiRouter);

  // 404 handler
  app.use((req: Request, res: Response) => {
    res.status(404).json({ error: 'Not found' });
  });

  // Error handler
  app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error('Error:', err);
    res.status(500).json({
      error: err.message || 'Internal server error',
    });
  });

  // Graceful shutdown
  process.on('SIGTERM', async () => {
    console.log('SIGTERM received, closing server...');
    await prisma.$disconnect();
    process.exit(0);
  });

  return app;
}
