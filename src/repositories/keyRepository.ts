import { KeyExchange } from '../models';

export class KeyRepository {
  public async create(data: any) {
    return KeyExchange.create(data);
  }

  public async findById(id: string) {
    return KeyExchange.findById(id);
  }

  public async findPendingExchangesForUser(userId: string) {
    return KeyExchange.find({
      recipientId: userId,
      status: 'pending'
    });
  }

  public async markAsFailed(exchangeId: string) {
    return KeyExchange.findByIdAndUpdate(
      exchangeId,
      { status: 'failed' },
      { new: true }
    );
  }

  public async completeExchange(exchangeId: string, recipientEphemeralPublicKey: string) {
    return KeyExchange.findByIdAndUpdate(
      exchangeId,
      { recipientEphemeralPublicKey, status: 'completed' },
      { new: true }
    );
  }
}

export default new KeyRepository();
