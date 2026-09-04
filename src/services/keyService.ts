import keyRepository from '../repositories/keyRepository';
import userRepository from '../repositories/userRepository';
import encryptionService from '../services/encryptionService'; // Wait, this is a local service in the old structure! It's actually in src/services/encryptionService.ts which is correct.
import { AppError } from '../utils/AppError';

export class KeyService {
  public async initiateKeyExchange(data: any, initiatorId: string) {
    const { recipientId, conversationId } = data;

    const recipient = await userRepository.findById(recipientId);
    if (!recipient) {
      throw new AppError('Recipient not found', 404);
    }

    const keyPair = encryptionService.generateKeyPair();

    const exchange = await keyRepository.create({
      initiatorId,
      recipientId,
      conversationId,
      initiatorEphemeralPublicKey: keyPair.publicKey,
      status: 'pending',
      expiresAt: new Date(Date.now() + 5 * 60 * 1000)
    });

    return {
      exchangeId: exchange.id,
      ephemeralPublicKey: keyPair.publicKey
    };
  }

  public async completeKeyExchange(data: any, userId: string) {
    const { exchangeId, recipientEphemeralPublicKey } = data;

    const exchange = await keyRepository.findById(exchangeId);
    if (!exchange) {
      throw new AppError('Key exchange not found', 404);
    }

    if (exchange.recipientId !== userId) {
      throw new AppError('Not authorized to complete this exchange', 403);
    }

    if (exchange.status !== 'pending') {
      throw new AppError('Exchange is no longer pending', 400);
    }

    if (new Date() > exchange.expiresAt) {
      await keyRepository.markAsFailed(exchangeId);
      throw new AppError('Exchange has expired', 400);
    }

    await keyRepository.completeExchange(exchangeId, recipientEphemeralPublicKey);

    return { exchangeId };
  }

  public async getPendingExchanges(userId: string) {
    return keyRepository.findPendingExchangesForUser(userId);
  }
}

export default new KeyService();
