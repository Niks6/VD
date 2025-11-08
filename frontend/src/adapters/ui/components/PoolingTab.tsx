import React, { useState } from 'react';
import { Card } from '../../../shared/components/Card';
import { Button } from '../../../shared/components/Button';
import { Select } from '../../../shared/components/Select';
import { LoadingSpinner } from '../../../shared/components/LoadingSpinner';
import { Alert } from '../../../shared/components/Alert';
import { useAsync } from '../../../shared/hooks/useAsync';
import { AdjustedCompliance, PoolValidationResult } from '../../../core/domain/Pooling';

interface PoolingTabProps {
  poolingUseCase: any;
}

export const PoolingTab: React.FC<PoolingTabProps> = ({ poolingUseCase }) => {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedVessels, setSelectedVessels] = useState<string[]>([]);
  const [alert, setAlert] = useState<{ type: 'success' | 'error' | 'warning'; message: string } | null>(null);
  const [validation, setValidation] = useState<PoolValidationResult | null>(null);

  const { data: vessels, isLoading, error, execute: refetchVessels } = useAsync<AdjustedCompliance[]>(
    () => poolingUseCase.getAdjustedCompliance(selectedYear),
    true
  );

  React.useEffect(() => {
    refetchVessels();
    setSelectedVessels([]);
    setValidation(null);
  }, [selectedYear]);

  const handleVesselToggle = (vessel: string) => {
    setSelectedVessels(prev => {
      const newSelection = prev.includes(vessel)
        ? prev.filter(v => v !== vessel)
        : [...prev, vessel];
      return newSelection;
    });
  };

  const handleValidatePool = async () => {
    if (selectedVessels.length < 2) {
      setAlert({ type: 'warning', message: 'Please select at least 2 vessels for pooling' });
      return;
    }

    try {
      const result = await poolingUseCase.validatePool({
        year: selectedYear,
        vessels: selectedVessels
      });
      setValidation(result);

      if (result.isValid) {
        setAlert({ type: 'success', message: 'Pool configuration is valid!' });
      } else {
        setAlert({ type: 'error', message: `Pool validation failed: ${result.errors.join(', ')}` });
      }
    } catch (error) {
      setAlert({ type: 'error', message: (error as Error).message });
    }
  };

  const handleCreatePool = async () => {
    if (!validation || !validation.isValid) {
      setAlert({ type: 'error', message: 'Please validate the pool first' });
      return;
    }

    try {
      const pool = await poolingUseCase.createPool({
        year: selectedYear,
        vessels: selectedVessels
      });
      setAlert({ type: 'success', message: `Pool ${pool.poolId} created successfully!` });
      setSelectedVessels([]);
      setValidation(null);
      refetchVessels();
    } catch (error) {
      setAlert({ type: 'error', message: (error as Error).message });
    }
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => currentYear - 5 + i);

  const selectedVesselData = vessels?.filter(v => selectedVessels.includes(v.vessel)) || [];
  const totalCB = selectedVesselData.reduce((sum, v) => sum + v.adjustedCB, 0);

  return (
    <div className="space-y-4">
      <Card title="Fuel EU Pooling - Article 21">
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded mb-4">
          <h4 className="font-semibold mb-2">Pooling Mechanism</h4>
          <p className="text-sm text-gray-700 mb-2">
            Pooling allows multiple vessels to combine their compliance balances. 
            Surplus vessels can help deficit vessels achieve compliance.
          </p>
          <div className="text-sm text-gray-700 space-y-1">
            <p><strong>Rules:</strong></p>
            <ul className="list-disc list-inside ml-2">
              <li>Pool sum must be ≥ 0</li>
              <li>Deficit vessels cannot exit worse than entry</li>
              <li>Surplus vessels cannot exit with negative CB</li>
            </ul>
          </div>
        </div>

        <div className="mb-4">
          <Select
            label="Select Year"
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            options={years.map(y => ({ value: y, label: y.toString() }))}
          />
        </div>
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

      {vessels && vessels.length > 0 && (
        <>
          <Card title="Available Vessels">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Select
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Vessel
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Year
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Adjusted CB
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {vessels.map((vessel) => {
                    const isSelected = selectedVessels.includes(vessel.vessel);
                    return (
                      <tr
                        key={vessel.vessel}
                        className={`cursor-pointer hover:bg-gray-50 ${isSelected ? 'bg-blue-50' : ''}`}
                        onClick={() => handleVesselToggle(vessel.vessel)}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleVesselToggle(vessel.vessel)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {vessel.vessel}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {vessel.year}
                        </td>
                        <td className={`px-6 py-4 whitespace-nowrap text-sm font-semibold ${
                          vessel.adjustedCB > 0 ? 'text-green-600' : vessel.adjustedCB < 0 ? 'text-red-600' : 'text-gray-600'
                        }`}>
                          {vessel.adjustedCB.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {vessel.adjustedCB > 0 ? (
                            <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded">Surplus</span>
                          ) : vessel.adjustedCB < 0 ? (
                            <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded">Deficit</span>
                          ) : (
                            <span className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded">Neutral</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>

          {selectedVessels.length > 0 && (
            <Card title="Pool Configuration">
              <div className="space-y-4">
                <div className={`p-6 rounded-lg border-2 ${totalCB >= 0 ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'}`}>
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="text-sm font-medium text-gray-600 mb-1">Pool Total CB</h4>
                      <p className={`text-4xl font-bold ${totalCB >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {totalCB.toFixed(2)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Selected Vessels</p>
                      <p className="text-2xl font-bold text-gray-900">{selectedVessels.length}</p>
                    </div>
                  </div>
                  {totalCB < 0 && (
                    <div className="mt-4 text-sm text-red-700">
                      ⚠️ Pool total is negative. Cannot create pool with negative sum.
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button
                    onClick={handleValidatePool}
                    variant="secondary"
                    disabled={selectedVessels.length < 2}
                    className="w-full"
                  >
                    Validate Pool
                  </Button>
                  <Button
                    onClick={handleCreatePool}
                    variant="success"
                    disabled={!validation || !validation.isValid}
                    className="w-full"
                  >
                    Create Pool
                  </Button>
                </div>

                {validation && (
                  <div className={`border-2 p-4 rounded-lg ${validation.isValid ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'}`}>
                    <h4 className="font-semibold mb-2">
                      {validation.isValid ? '✅ Validation Passed' : '❌ Validation Failed'}
                    </h4>
                    
                    {validation.errors.length > 0 && (
                      <div className="mb-4">
                        <p className="text-sm font-medium text-red-700 mb-1">Errors:</p>
                        <ul className="list-disc list-inside text-sm text-red-600">
                          {validation.errors.map((error, idx) => (
                            <li key={idx}>{error}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-100">
                          <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-600">Vessel</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-600">CB Before</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-600">CB After</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-600">Change</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {validation.members.map((member, idx) => (
                            <tr key={idx}>
                              <td className="px-4 py-2 text-sm font-medium">{member.vessel}</td>
                              <td className={`px-4 py-2 text-sm ${member.cbBefore >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {member.cbBefore.toFixed(2)}
                              </td>
                              <td className={`px-4 py-2 text-sm ${member.cbAfter >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {member.cbAfter.toFixed(2)}
                              </td>
                              <td className={`px-4 py-2 text-sm ${
                                member.cbAfter >= member.cbBefore ? 'text-green-600' : 'text-red-600'
                              }`}>
                                {(member.cbAfter - member.cbBefore).toFixed(2)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          )}
        </>
      )}

      {vessels && vessels.length === 0 && (
        <Card>
          <p className="text-gray-500 text-center py-8">
            No vessels available for year {selectedYear}
          </p>
        </Card>
      )}
    </div>
  );
};
