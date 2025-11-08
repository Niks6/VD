import React from 'react';
import { ComparisonResult } from '../../../core/domain/Comparison';
import { Card } from '../../../shared/components/Card';
import { LoadingSpinner } from '../../../shared/components/LoadingSpinner';
import { Alert } from '../../../shared/components/Alert';
import { useAsync } from '../../../shared/hooks/useAsync';

interface CompareTabProps {
  comparisonUseCase: any;
}

export const CompareTab: React.FC<CompareTabProps> = ({ comparisonUseCase }) => {
  const { data: comparison, isLoading, error } = useAsync<ComparisonResult>(
    () => comparisonUseCase.getComparison(),
    true
  );

  if (isLoading) {
    return (
      <Card title="Route Comparison">
        <LoadingSpinner />
      </Card>
    );
  }

  if (error) {
    return <Alert type="error" message={error.message} />;
  }

  if (!comparison) {
    return <Alert type="info" message="No comparison data available" />;
  }

  const ComplianceIndicator = ({ isCompliant }: { isCompliant: boolean }) => (
    <span className={`text-2xl ${isCompliant ? 'text-green-600' : 'text-red-600'}`}>
      {isCompliant ? '✅' : '❌'}
    </span>
  );

  return (
    <div className="space-y-4">
      <Card title="Compliance Target">
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
          <p className="text-lg">
            <strong>Target GHG Intensity:</strong> {comparison.target.toFixed(4)} gCO₂e/MJ
          </p>
          <p className="text-sm text-gray-600 mt-1">
            (2% reduction below 91.16 gCO₂e/MJ baseline)
          </p>
        </div>
      </Card>

      <Card title="Comparison Results">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Route ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  GHG Intensity (gCO₂e/MJ)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fuel Consumption (t)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Emissions (t)
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr className="bg-blue-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  Baseline
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {comparison.baseline.routeId}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {comparison.baseline.ghgIntensity.toFixed(4)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {comparison.baseline.fuelConsumption.toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {comparison.baseline.totalEmissions.toFixed(2)}
                </td>
              </tr>
              <tr className={comparison.isCompliant ? 'bg-green-50' : 'bg-red-50'}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  Comparison
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {comparison.comparison.routeId}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {comparison.comparison.ghgIntensity.toFixed(4)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {comparison.comparison.fuelConsumption.toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {comparison.comparison.totalEmissions.toFixed(2)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>

      <Card title="Performance Analysis">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-gray-500 mb-2">Percentage Difference</h4>
            <p className={`text-3xl font-bold ${comparison.percentDiff < 0 ? 'text-green-600' : 'text-red-600'}`}>
              {comparison.percentDiff.toFixed(2)}%
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {comparison.percentDiff < 0 ? 'Improvement' : 'Degradation'} from baseline
            </p>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-gray-500 mb-2">Compliance Status</h4>
            <div className="flex items-center space-x-2">
              <ComplianceIndicator isCompliant={comparison.isCompliant} />
              <span className="text-xl font-semibold">
                {comparison.isCompliant ? 'Compliant' : 'Non-Compliant'}
              </span>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-gray-500 mb-2">vs Target</h4>
            <p className={`text-3xl font-bold ${
              comparison.comparison.ghgIntensity <= comparison.target ? 'text-green-600' : 'text-red-600'
            }`}>
              {((comparison.comparison.ghgIntensity / comparison.target - 1) * 100).toFixed(2)}%
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {comparison.comparison.ghgIntensity <= comparison.target ? 'Below' : 'Above'} target
            </p>
          </div>
        </div>
      </Card>

      <Card title="Visual Comparison">
        <div className="space-y-4">
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium">Baseline: {comparison.baseline.ghgIntensity.toFixed(4)} gCO₂e/MJ</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-6">
              <div
                className="bg-blue-600 h-6 rounded-full flex items-center justify-end pr-2"
                style={{ width: `${(comparison.baseline.ghgIntensity / 100) * 100}%` }}
              >
                <span className="text-xs text-white font-medium">Baseline</span>
              </div>
            </div>
          </div>

          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium">Comparison: {comparison.comparison.ghgIntensity.toFixed(4)} gCO₂e/MJ</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-6">
              <div
                className={`h-6 rounded-full flex items-center justify-end pr-2 ${
                  comparison.isCompliant ? 'bg-green-600' : 'bg-red-600'
                }`}
                style={{ width: `${(comparison.comparison.ghgIntensity / 100) * 100}%` }}
              >
                <span className="text-xs text-white font-medium">Current</span>
              </div>
            </div>
          </div>

          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium">Target: {comparison.target.toFixed(4)} gCO₂e/MJ</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-6">
              <div
                className="bg-yellow-500 h-6 rounded-full flex items-center justify-end pr-2"
                style={{ width: `${(comparison.target / 100) * 100}%` }}
              >
                <span className="text-xs text-white font-medium">Target</span>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};
