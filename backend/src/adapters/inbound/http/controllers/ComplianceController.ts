import { Request, Response, NextFunction } from 'express';
import { IComplianceService } from '../../../../core/ports/IServices';
import { IRoutesRepository } from '../../../../core/ports/IRepositories';
import { Route } from '../../../../core/domain/Route';

export class ComplianceController {
  constructor(
    private readonly complianceService: IComplianceService,
    private readonly routesRepository: IRoutesRepository
  ) {}

  getComplianceBalance = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { shipId, year } = req.query;

      if (!year) {
        res.status(400).json({ error: 'year is required' });
        return;
      }

      const yearNum = parseInt(year as string);

      // If shipId provided, return single ship data
      if (shipId) {
        const balance = await this.complianceService.getComplianceBalance(
          shipId as string,
          yearNum
        );
        res.json(balance);
        return;
      }

      // Otherwise, return all ships for the year
      const routes = await this.routesRepository.findByYear(yearNum);
      const balances = await Promise.all(
        routes.map((route: Route) => 
          this.complianceService.getComplianceBalance(route.routeId, yearNum)
        )
      );

      res.json(balances);
    } catch (error) {
      next(error);
    }
  };

  getAdjustedCompliance = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { shipId, year } = req.query;

      if (!year) {
        res.status(400).json({ error: 'year is required' });
        return;
      }

      const yearNum = parseInt(year as string);

      // If shipId provided, return single ship data
      if (shipId) {
        const adjusted = await this.complianceService.getAdjustedCompliance(
          shipId as string,
          yearNum
        );
        res.json(adjusted);
        return;
      }

      // Otherwise, return all ships for the year
      const routes = await this.routesRepository.findByYear(yearNum);
      const adjustedList = await Promise.all(
        routes.map((route: Route) => 
          this.complianceService.getAdjustedCompliance(route.routeId, yearNum)
        )
      );

      res.json(adjustedList);
    } catch (error) {
      next(error);
    }
  };
}
