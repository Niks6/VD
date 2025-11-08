import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import { App } from './adapters/ui/App';

// Infrastructure layer - API clients
import { ApiClient } from './adapters/infrastructure/api/ApiClient';
import { RoutesApiRepository } from './adapters/infrastructure/api/RoutesApiRepository';
import { BankingApiRepository } from './adapters/infrastructure/api/BankingApiRepository';
import { PoolingApiRepository } from './adapters/infrastructure/api/PoolingApiRepository';

// Application layer - Use cases
import { RoutesUseCase, ComparisonUseCase } from './core/application/RoutesUseCase';
import { BankingUseCase } from './core/application/BankingUseCase';
import { PoolingUseCase } from './core/application/PoolingUseCase';

// Dependency injection setup
const apiClient = new ApiClient();

// Repositories
const routesRepository = new RoutesApiRepository(apiClient);
const bankingRepository = new BankingApiRepository(apiClient);
const poolingRepository = new PoolingApiRepository(apiClient);

// Use cases
const routesUseCase = new RoutesUseCase(routesRepository);
const comparisonUseCase = new ComparisonUseCase(routesRepository);
const bankingUseCase = new BankingUseCase(bankingRepository);
const poolingUseCase = new PoolingUseCase(poolingRepository);

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <App
      routesUseCase={routesUseCase}
      comparisonUseCase={comparisonUseCase}
      bankingUseCase={bankingUseCase}
      poolingUseCase={poolingUseCase}
    />
  </React.StrictMode>
);
