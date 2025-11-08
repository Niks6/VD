import { Request, Response, NextFunction } from 'express';
import { IComplianceService } from '../../../core/ports/IServices';

export class ComplianceController {
  constructor(private readonly complianceService: IComplianceService) {}

  getComplianceBalance = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { shipId, year } = req.query;

      if (!shipId || !year) {
        return res.status(400).json({ error: 'shipId and year are required' });
      }

      const balance = await this.complianceService.getComplianceBalance(
        shipId as string,
        parseInt(year as string)
      );

      res.json(balance);
    } catch (error) {
      next(error);
    }
  };

  getAdjustedCompliance = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { shipId, year } = req.query;

      if (!shipId || !year) {
        return res.status(400).json({ error: 'shipId and year are required' });
      }

      const adjusted = await this.complianceService.getAdjustedCompliance(
        shipId as string,
        parseInt(year as string)
      );

      res.json(adjusted);
    } catch (error) {
      next(error);
    }
  };
}
