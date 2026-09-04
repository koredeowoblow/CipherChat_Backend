import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import keyService from '../services/keyService';
import { ResponseHandler } from '../utils/responseHandler';

export class KeyController {
  public async initiateKeyExchange(req: AuthRequest, res: Response) {
    const initiatorId = req.user?.id as string;
    const result = await keyService.initiateKeyExchange(req.body, initiatorId);

    return ResponseHandler.success(res, 201, 'Key exchange initiated', result);
  }

  public async completeKeyExchange(req: AuthRequest, res: Response) {
    const userId = req.user?.id as string;
    const result = await keyService.completeKeyExchange(req.body, userId);

    return ResponseHandler.success(res, 200, 'Key exchange completed', result);
  }

  public async getPendingExchanges(req: AuthRequest, res: Response) {
    const userId = req.user?.id as string;
    const exchanges = await keyService.getPendingExchanges(userId);

    return ResponseHandler.success(res, 200, 'Pending exchanges retrieved', exchanges);
  }
}

export default new KeyController();
