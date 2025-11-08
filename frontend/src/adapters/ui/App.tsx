import React, { useState } from 'react';
import { RoutesTab } from './components/RoutesTab';
import { CompareTab } from './components/CompareTab';
import { BankingTab } from './components/BankingTab';
import { PoolingTab } from './components/PoolingTab';

// Dependency injection - Use cases passed as props
interface AppProps {
  routesUseCase: any;
  comparisonUseCase: any;
  bankingUseCase: any;
  poolingUseCase: any;
}

type TabType = 'routes' | 'compare' | 'banking' | 'pooling';

export const App: React.FC<AppProps> = ({
  routesUseCase,
  comparisonUseCase,
  bankingUseCase,
  poolingUseCase
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('routes');

  const tabs: Array<{ id: TabType; label: string; icon: string }> = [
    { id: 'routes', label: 'Routes', icon: '🚢' },
    { id: 'compare', label: 'Compare', icon: '📊' },
    { id: 'banking', label: 'Banking', icon: '🏦' },
    { id: 'pooling', label: 'Pooling', icon: '🤝' },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900">
            ⚓ Fuel EU Compliance Dashboard
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Maritime vessel compliance monitoring and management
          </p>
        </div>
      </header>

      {/* Tab Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="bg-white rounded-lg shadow-md">
          <nav className="flex border-b border-gray-200" role="tablist">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                role="tab"
                aria-selected={activeTab === tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 px-6 py-4 text-center font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <span className="text-xl mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'routes' && <RoutesTab routesUseCase={routesUseCase} />}
            {activeTab === 'compare' && <CompareTab comparisonUseCase={comparisonUseCase} />}
            {activeTab === 'banking' && <BankingTab bankingUseCase={bankingUseCase} />}
            {activeTab === 'pooling' && <PoolingTab poolingUseCase={poolingUseCase} />}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-12">
        <div className="text-center text-sm text-gray-500">
          <p>Fuel EU Maritime Regulation Compliance Dashboard</p>
          <p className="mt-1">Articles 20 (Banking) & 21 (Pooling)</p>
        </div>
      </footer>
    </div>
  );
};
