import { Request, Response, NextFunction } from 'express';
import { IBankingService } from '../../../../core/ports/IServices';

export class BankingController {
  constructor(private readonly bankingService: IBankingService) {}

  bankSurplus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { shipId, year, amount } = req.body;

      if (!shipId || !year || amount === undefined) {
        res.status(400).json({ error: 'shipId, year, and amount are required' });
        return;
      }

      const result = await this.bankingService.bankSurplus({
        shipId,
        year,
        amount,
      });

      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  applyBanked = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { shipId, deficitYear, amount } = req.body;

      if (!shipId || !deficitYear || amount === undefined) {
        res.status(400).json({ error: 'shipId, deficitYear, and amount are required' });
        return;
      }

      const result = await this.bankingService.applyBanked({
        shipId,
        deficitYear,
        amount,
      });

      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  getAvailableBalance = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { shipId } = req.query;

      if (!shipId) {
        res.status(400).json({ error: 'shipId is required' });
        return;
      }

      const balance = await this.bankingService.getAvailableBalance(shipId as string);
      res.json({ shipId, availableBalance: balance });
    } catch (error) {
      next(error);
    }
  };

  getBankingRecords = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { shipId, year } = req.query;

      if (!shipId) {
        res.status(400).json({ error: 'shipId is required' });
        return;
      }

      const records = await this.bankingService.getBankingRecords(
        shipId as string,
        year ? parseInt(year as string) : undefined
      );

      res.json(records);
    } catch (error) {
      next(error);
    }
  };
}
