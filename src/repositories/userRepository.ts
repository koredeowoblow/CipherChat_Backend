import { User } from '../models';

export class UserRepository {
  public async findByEmail(email: string) {
    return User.findOne({ email });
  }

  public async findByUsername(username: string) {
    return User.findOne({ username });
  }

  public async findById(id: string, options: any = {}) {
    const query = User.findById(id);
    if (options.attributes && options.attributes.exclude) {
      const select = options.attributes.exclude.map((field: string) => `-${field}`).join(' ');
      query.select(select);
    }
    if (options.attributes && Array.isArray(options.attributes)) {
      query.select(options.attributes.join(' '));
    }
    return query.exec();
  }

  public async create(data: any) {
    return User.create(data);
  }

  public async updateLastSeen(user: any) {
    user.lastSeen = new Date();
    user.status = 'online';
    return user.save();
  }

  public async searchByUsername(usernameQuery: string, limit: number = 20) {
    return User.find({
      username: { $regex: usernameQuery, $options: 'i' }
    })
    .select('id username displayName avatar status')
    .limit(limit);
  }

  public async blockUser(userId: string, blockedUserId: string) {
    return User.findByIdAndUpdate(userId, { $addToSet: { blockedUsers: blockedUserId } }, { new: true });
  }

  public async unblockUser(userId: string, blockedUserId: string) {
    return User.findByIdAndUpdate(userId, { $pull: { blockedUsers: blockedUserId } }, { new: true });
  }
}

export default new UserRepository();
