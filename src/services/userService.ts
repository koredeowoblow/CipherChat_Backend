import userRepository from '../repositories/userRepository';
import { AppError } from '../utils/AppError';

export class UserService {
  public async getProfile(userId: string) {
    const user = await userRepository.findById(userId, {
      attributes: { exclude: ['passwordHash'] }
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }
    return user;
  }

  public async getPublicKey(userId: string) {
    const user = await userRepository.findById(userId, {
      attributes: ['id', 'publicKey', 'keyFingerprint']
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }
    return user;
  }

  public async searchUsers(query: string) {
    if (!query) {
      throw new AppError('Search query is required', 400);
    }
    return userRepository.searchByUsername(query);
  }

  public async blockUser(userId: string, blockedUserId: string) {
    if (userId === blockedUserId) {
      throw new AppError('Cannot block yourself', 400);
    }
    const targetUser = await userRepository.findById(blockedUserId);
    if (!targetUser) throw new AppError('User not found', 404);
    
    return userRepository.blockUser(userId, blockedUserId);
  }

  public async unblockUser(userId: string, blockedUserId: string) {
    return userRepository.unblockUser(userId, blockedUserId);
  }
}

export default new UserService();
