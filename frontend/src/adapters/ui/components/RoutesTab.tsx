import React, { useState } from 'react';
import { Route, RouteFilters } from '../../../core/domain/Route';
import { Card } from '../../../shared/components/Card';
import { Button } from '../../../shared/components/Button';
import { Select } from '../../../shared/components/Select';
import { LoadingSpinner } from '../../../shared/components/LoadingSpinner';
import { Alert } from '../../../shared/components/Alert';
import { useAsync } from '../../../shared/hooks/useAsync';

interface RoutesTabProps {
  routesUseCase: any; // Will be injected
}

export const RoutesTab: React.FC<RoutesTabProps> = ({ routesUseCase }) => {
  const [filters, setFilters] = useState<RouteFilters>({});
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const { data: routes, isLoading, error, execute: refetchRoutes } = useAsync<Route[]>(
    () => routesUseCase.getRoutes(filters),
    true
  );

  const handleFilterChange = (key: keyof RouteFilters, value: string) => {
    const newFilters = { ...filters };
    if (value === 'all' || value === '') {
      delete newFilters[key];
    } else {
      if (key === 'year') {
        newFilters[key] = parseInt(value);
      } else {
        newFilters[key] = value;
      }
    }
    setFilters(newFilters);
  };

  const handleSetBaseline = async (routeId: string) => {
    try {
      await routesUseCase.setBaseline(routeId);
      setAlert({ type: 'success', message: `Route ${routeId} set as baseline` });
      refetchRoutes();
    } catch (error) {
      setAlert({ type: 'error', message: (error as Error).message });
    }
  };

  // Get unique values for filters
  const vesselTypes = ['all', ...Array.from(new Set(routes?.map(r => r.vesselType) || []))];
  const fuelTypes = ['all', ...Array.from(new Set(routes?.map(r => r.fuelType) || []))];
  const years = ['all', ...Array.from(new Set(routes?.map(r => r.year) || []))];

  React.useEffect(() => {
    refetchRoutes();
  }, [filters]);

  return (
    <div className="space-y-4">
      {alert && (
        <Alert
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert(null)}
        />
      )}

      <Card title="Filters">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Select
            label="Vessel Type"
            value={filters.vesselType || 'all'}
            onChange={(e) => handleFilterChange('vesselType', e.target.value)}
            options={vesselTypes.map(v => ({ value: v, label: v }))}
          />
          <Select
            label="Fuel Type"
            value={filters.fuelType || 'all'}
            onChange={(e) => handleFilterChange('fuelType', e.target.value)}
            options={fuelTypes.map(f => ({ value: f, label: f }))}
          />
          <Select
            label="Year"
            value={filters.year?.toString() || 'all'}
            onChange={(e) => handleFilterChange('year', e.target.value)}
            options={years.map(y => ({ value: y, label: y.toString() }))}
          />
        </div>
      </Card>

      <Card title="Routes">
        {isLoading && <LoadingSpinner />}
        {error && <Alert type="error" message={error.message} />}
        {routes && routes.length === 0 && (
          <p className="text-gray-500 text-center py-8">No routes found</p>
        )}
        {routes && routes.length > 0 && (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Route ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Vessel Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fuel Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Year
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    GHG Intensity (gCO₂e/MJ)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fuel Consumption (t)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Distance (km)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Emissions (t)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {routes.map((route) => (
                  <tr key={route.routeId} className={route.isBaseline ? 'bg-blue-50' : ''}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {route.routeId}
                      {route.isBaseline && (
                        <span className="ml-2 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                          Baseline
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {route.vesselType}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {route.fuelType}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {route.year}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {route.ghgIntensity.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {route.fuelConsumption.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {route.distance.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {route.totalEmissions.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {!route.isBaseline && (
                        <Button
                          size="sm"
                          onClick={() => handleSetBaseline(route.routeId)}
                        >
                          Set Baseline
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};
