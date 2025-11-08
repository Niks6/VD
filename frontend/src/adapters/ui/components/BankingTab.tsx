import React, { useState } from 'react';
import { Card } from '../../../shared/components/Card';
import { Button } from '../../../shared/components/Button';
import { Select } from '../../../shared/components/Select';
import { LoadingSpinner } from '../../../shared/components/LoadingSpinner';
import { Alert } from '../../../shared/components/Alert';
import { ComplianceBalance, BankingResult } from '../../../core/domain/Banking';

interface BankingTabProps {
  bankingUseCase: any;
}

export const BankingTab: React.FC<BankingTabProps> = ({ bankingUseCase }) => {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedShip, setSelectedShip] = useState<string>('');
  const [amount, setAmount] = useState<number>(0);
  const [deficitYear, setDeficitYear] = useState(new Date().getFullYear());
  const [alert, setAlert] = useState<{ type: 'success' | 'error' | 'warning'; message: string } | null>(null);
  const [operationResult, setOperationResult] = useState<BankingResult | null>(null);
  const [allBalances, setAllBalances] = useState<ComplianceBalance[]>([]);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  React.useEffect(() => {
    fetchBalances();
  }, [selectedYear]);

  const fetchBalances = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const API_BASE_URL = 'http://localhost:3000/api';
      const response = await fetch(`${API_BASE_URL}/compliance/cb?year=${selectedYear}`);
      if (!response.ok) {
        throw new Error('Failed to fetch compliance balances');
      }
      const data = await response.json();
      setAllBalances(Array.isArray(data) ? data : [data]);
      
      // Auto-select first ship if none selected
      if (!selectedShip && data.length > 0) {
        setSelectedShip(data[0].shipId);
      }
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  };

  const balance = allBalances.find(b => b.shipId === selectedShip) || null;

  const handleBankSurplus = async () => {
    if (!balance || balance.cb <= 0) {
      setAlert({ type: 'error', message: 'Cannot bank non-positive compliance balance' });
      return;
    }

    if (amount <= 0 || amount > balance.cb) {
      setAlert({ type: 'error', message: 'Invalid amount. Must be positive and not exceed current CB.' });
      return;
    }

    try {
      const result = await bankingUseCase.bankSurplus(selectedYear, amount);
      setOperationResult(result);
      setAlert({ type: 'success', message: `Successfully banked ${amount.toFixed(2)} CB units` });
      fetchBalances();
    } catch (error) {
      setAlert({ type: 'error', message: (error as Error).message });
    }
  };

  const handleApplyBanked = async () => {
    if (amount <= 0) {
      setAlert({ type: 'error', message: 'Amount must be positive' });
      return;
    }

    try {
      const result = await bankingUseCase.applyBanked({ deficitYear, amount });
      setOperationResult(result);
      setAlert({ type: 'success', message: `Successfully applied ${amount.toFixed(2)} CB units to year ${deficitYear}` });
      fetchBalances();
    } catch (error) {
      setAlert({ type: 'error', message: (error as Error).message });
    }
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => currentYear - 5 + i);

  return (
    <div className="space-y-4">
      <Card title="Fuel EU Banking - Article 20">
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded mb-4">
          <h4 className="font-semibold mb-2">Banking Mechanism</h4>
          <p className="text-sm text-gray-700">
            Banking allows vessels with surplus compliance balance (CB {'>'} 0) to save it for future use.
            The banked surplus can later be applied to deficit years to achieve compliance.
          </p>
        </div>

        <div className="mb-4">
          <Select
            label="Select Year"
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            options={years.map(y => ({ value: y, label: y.toString() }))}
          />
        </div>

        {allBalances.length > 0 && (
          <div className="mb-4">
            <Select
              label="Select Ship/Route"
              value={selectedShip}
              onChange={(e) => setSelectedShip(e.target.value)}
              options={allBalances.map(b => ({ value: b.shipId, label: b.shipId }))}
            />
          </div>
        )}
      </Card>

      {alert && (
        <Alert
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert(null)}
        />
      )}

      {isLoading && (
        <Card>
          <LoadingSpinner />
        </Card>
      )}

      {error && <Alert type="error" message={error.message} />}

      {balance && (
        <>
          <Card title="Current Compliance Balance">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className={`p-6 rounded-lg ${balance.cb > 0 ? 'bg-green-50' : balance.cb < 0 ? 'bg-red-50' : 'bg-gray-50'}`}>
                <h4 className="text-sm font-medium text-gray-500 mb-2">Year</h4>
                <p className="text-3xl font-bold text-gray-900">{balance.year}</p>
              </div>

              <div className={`p-6 rounded-lg ${balance.cb > 0 ? 'bg-green-50' : balance.cb < 0 ? 'bg-red-50' : 'bg-gray-50'}`}>
                <h4 className="text-sm font-medium text-gray-500 mb-2">Compliance Balance (CB)</h4>
                <p className={`text-3xl font-bold ${balance.cb > 0 ? 'text-green-600' : balance.cb < 0 ? 'text-red-600' : 'text-gray-600'}`}>
                  {balance.cb.toFixed(2)}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {balance.cb > 0 ? 'Surplus' : balance.cb < 0 ? 'Deficit' : 'Balanced'}
                </p>
              </div>

              <div className="p-6 rounded-lg bg-blue-50">
                <h4 className="text-sm font-medium text-gray-500 mb-2">Status</h4>
                <p className="text-xl font-semibold text-gray-900">
                  {balance.cb > 0 ? '✅ Can Bank Surplus' : balance.cb < 0 ? '⚠️ Needs Banking' : '➖ Neutral'}
                </p>
              </div>
            </div>
          </Card>

          <Card title="Banking Operations">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Bank Surplus */}
              <div className="border border-gray-200 rounded-lg p-6">
                <h4 className="text-lg font-semibold mb-4">Bank Surplus</h4>
                <p className="text-sm text-gray-600 mb-4">
                  Save positive CB for future use
                </p>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Amount to Bank
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max={balance.cb > 0 ? balance.cb : 0}
                      value={amount}
                      onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      disabled={balance.cb <= 0}
                    />
                    {balance.cb > 0 && (
                      <p className="text-xs text-gray-500 mt-1">
                        Maximum: {balance.cb.toFixed(2)}
                      </p>
                    )}
                  </div>

                  <Button
                    onClick={handleBankSurplus}
                    disabled={balance.cb <= 0 || amount <= 0}
                    className="w-full"
                    variant="success"
                  >
                    Bank Surplus
                  </Button>

                  {balance.cb <= 0 && (
                    <Alert type="warning" message="No surplus available to bank" />
                  )}
                </div>
              </div>

              {/* Apply Banked */}
              <div className="border border-gray-200 rounded-lg p-6">
                <h4 className="text-lg font-semibold mb-4">Apply Banked CB</h4>
                <p className="text-sm text-gray-600 mb-4">
                  Use previously banked CB to cover deficit
                </p>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Deficit Year
                    </label>
                    <Select
                      value={deficitYear}
                      onChange={(e) => setDeficitYear(parseInt(e.target.value))}
                      options={years.map(y => ({ value: y, label: y.toString() }))}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Amount to Apply
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={amount}
                      onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <Button
                    onClick={handleApplyBanked}
                    disabled={amount <= 0}
                    className="w-full"
                    variant="primary"
                  >
                    Apply Banked CB
                  </Button>
                </div>
              </div>
            </div>
          </Card>

          {operationResult && (
            <Card title="Operation Result">
              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">CB Before</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {operationResult.cb_before.toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Applied/Banked</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {operationResult.applied.toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">CB After</p>
                    <p className="text-2xl font-bold text-green-600">
                      {operationResult.cb_after.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  );
};
