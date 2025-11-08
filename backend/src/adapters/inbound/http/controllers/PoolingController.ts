import { Request, Response, NextFunction } from 'express';
import { IPoolingService } from '../../../core/ports/IServices';

export class PoolingController {
  constructor(private readonly poolingService: IPoolingService) {}

  createPool = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { year, vessels } = req.body;

      if (!year || !vessels || !Array.isArray(vessels)) {
        res.status(400).json({ error: 'year and vessels array are required' });
        return;
      }

      const pool = await this.poolingService.createPool({
        year,
        shipIds: vessels,
      });

      res.status(201).json(pool);
    } catch (error) {
      next(error);
    }
  };

  validatePool = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { year, vessels } = req.body;

      if (!year || !vessels || !Array.isArray(vessels)) {
        res.status(400).json({ error: 'year and vessels array are required' });
        return;
      }

      const validation = await this.poolingService.validatePool({
        year,
        shipIds: vessels,
      });

      res.json(validation);
    } catch (error) {
      next(error);
    }
  };
}
