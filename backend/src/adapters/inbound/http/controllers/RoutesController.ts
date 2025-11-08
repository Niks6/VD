import { Request, Response, NextFunction } from 'express';
import { IRoutesService } from '../../../core/ports/IServices';

export class RoutesController {
  constructor(private readonly routesService: IRoutesService) {}

  getAllRoutes = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { vesselType, fuelType, year } = req.query;

      const filters = {
        vesselType: vesselType as string | undefined,
        fuelType: fuelType as string | undefined,
        year: year ? parseInt(year as string) : undefined,
      };

      const routes = await this.routesService.getRoutes(filters);
      res.json(routes);
    } catch (error) {
      next(error);
    }
  };

  setBaseline = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { routeId } = req.params;
      await this.routesService.setBaseline(routeId);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };

  getComparison = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const comparison = await this.routesService.getComparison();
      res.json(comparison);
    } catch (error) {
      next(error);
    }
  };
}
