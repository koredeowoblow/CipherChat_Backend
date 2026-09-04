import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import userService from '../services/userService';
import { ResponseHandler } from '../utils/responseHandler';
import { UserDto } from '../dtos/user.dto';

export class UserController {
  public async getProfile(req: AuthRequest, res: Response) {
    const user = await userService.getProfile(req.user?.id as string);
    return ResponseHandler.success(res, 200, 'User profile retrieved', UserDto.toResponse(user));
  }

  public async getPublicKey(req: Request, res: Response) {
    const userId = req.params.userId as string;
    const user = await userService.getPublicKey(userId);
    
    return ResponseHandler.success(res, 200, 'Public key retrieved', {
      userId: user.id,
      publicKey: user.publicKey,
      fingerprint: user.keyFingerprint
    });
  }

  public async searchUsers(req: AuthRequest, res: Response) {
    console.log('Search query received:', req.query);
    const query = (req.query.q || req.query.query || '') as string;
    const users = await userService.searchUsers(query);
    
    return ResponseHandler.success(res, 200, 'Users retrieved', UserDto.toResponseList(users));
  }

  public async blockUser(req: AuthRequest, res: Response) {
    const userId = req.user?.id as string;
    const { blockedUserId } = req.body;
    
    if (!blockedUserId) {
      return ResponseHandler.error(res, 400, 'blockedUserId is required');
    }

    await userService.blockUser(userId, blockedUserId);
    return ResponseHandler.success(res, 200, 'User blocked successfully');
  }

  public async unblockUser(req: AuthRequest, res: Response) {
    const userId = req.user?.id as string;
    const { blockedUserId } = req.body;
    
    if (!blockedUserId) {
      return ResponseHandler.error(res, 400, 'blockedUserId is required');
    }

    await userService.unblockUser(userId, blockedUserId);
    return ResponseHandler.success(res, 200, 'User unblocked successfully');
  }
}

export default new UserController();
