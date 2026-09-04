import userRepository from '../repositories/userRepository';
import { AppError } from '../utils/AppError';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export class AuthService {
  public async register(data: any) {
    const { username, email, password, publicKey, keyFingerprint } = data;

    const existingUser = await userRepository.findByEmail(email);
    if (existingUser) {
      throw new AppError('Email already in use', 400);
    }

    const existingUsername = await userRepository.findByUsername(username);
    if (existingUsername) {
      throw new AppError('Username already taken', 400);
    }

    const saltRounds = parseInt(process.env.SALT_ROUNDS || '12', 10);
    const passwordHash = await bcrypt.hash(password, saltRounds);

    const user = await userRepository.create({
      username,
      email,
      passwordHash,
      publicKey,
      keyFingerprint
    });

    const token = jwt.sign(
      { id: user.id, username: user.username, email: user.email },
      process.env.JWT_SECRET as string,
      { expiresIn: process.env.JWT_EXPIRY || '24h' } as jwt.SignOptions
    );

    return { token, user };
  }

  public async login(data: any) {
    const { email, password } = data;

    const user = await userRepository.findByEmail(email);
    if (!user) {
      throw new AppError('Invalid email or password', 401);
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      throw new AppError('Invalid email or password', 401);
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, email: user.email },
      process.env.JWT_SECRET as string,
      { expiresIn: process.env.JWT_EXPIRY || '24h' } as jwt.SignOptions
    );

    await userRepository.updateLastSeen(user);

    return { token, user };
  }
}

export default new AuthService();
