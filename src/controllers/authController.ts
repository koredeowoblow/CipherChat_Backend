import { Request, Response } from 'express';
import authService from '../services/authService';
import { ResponseHandler } from '../utils/responseHandler';
import { AuthResponseDto } from '../dtos/auth.dto';

export class AuthController {
  public async register(req: Request, res: Response) {
    const { token, user } = await authService.register(req.body);
    
    return ResponseHandler.success(
      res,
      201,
      'User registered successfully',
      AuthResponseDto.toResponse(token, user)
    );
  }

  public async login(req: Request, res: Response) {
    const { token, user } = await authService.login(req.body);

    return ResponseHandler.success(
      res,
      200,
      'Logged in successfully',
      AuthResponseDto.toResponse(token, user)
    );
  }
}

export default new AuthController();
