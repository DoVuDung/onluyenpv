import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  Inject,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import { User, Role } from '@onluyenphongvan/types';
import { IUserRepository } from './infrastructure/user.repository';
import { RedisService } from '../../shared/redis/redis.service';

export const USER_REPOSITORY = 'USER_REPOSITORY';

interface TokenPayload {
  sub: string;
  email: string;
  role: Role;
  exp: number;
}

@Injectable()
export class AuthService {
  private readonly jwtSecret: string;
  private readonly refreshSecret: string;

  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepository: IUserRepository,
    private readonly redisService: RedisService,
    private readonly configService: ConfigService
  ) {
    this.jwtSecret =
      this.configService.get<string>('JWT_SECRET') ?? 'fallback_jwt_secret_for_dev_only_12345';
    this.refreshSecret =
      this.configService.get<string>('REFRESH_SECRET') ?? 'fallback_refresh_secret_for_dev_only_67890';
  }

  private hashPassword(password: string): string {
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.scryptSync(password, salt, 64).toString('hex');
    return `${salt}:${hash}`;
  }

  private verifyPassword(password: string, storedHash: string): boolean {
    const parts = storedHash.split(':');
    if (parts.length !== 2) return false;
    const [salt, originalHash] = parts as [string, string];
    const hash = crypto.scryptSync(password, salt, 64).toString('hex');
    const buf1 = Buffer.from(hash);
    const buf2 = Buffer.from(originalHash);
    if (buf1.length !== buf2.length) return false;
    return crypto.timingSafeEqual(buf1, buf2);
  }

  private signJwt(payload: Record<string, unknown>, secret: string, expiresInSec: number): string {
    const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
    const exp = Math.floor(Date.now() / 1000) + expiresInSec;
    const bodyPayload = { ...payload, exp };
    const body = Buffer.from(JSON.stringify(bodyPayload)).toString('base64url');
    const signature = crypto
      .createHmac('sha256', secret)
      .update(`${header}.${body}`)
      .digest('base64url');
    return `${header}.${body}.${signature}`;
  }

  private verifyJwt<T = TokenPayload>(token: string, secret: string): T | null {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const [header, body, signature] = parts as [string, string, string];
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(`${header}.${body}`)
      .digest('base64url');

    const buf1 = Buffer.from(signature);
    const buf2 = Buffer.from(expectedSignature);
    if (buf1.length !== buf2.length) return null;
    if (!crypto.timingSafeEqual(buf1, buf2)) {
      return null;
    }

    try {
      const decoded = JSON.parse(Buffer.from(body, 'base64url').toString('utf-8')) as T & { exp?: number };
      if (decoded.exp && decoded.exp < Math.floor(Date.now() / 1000)) {
        return null;
      }
      return decoded;
    } catch {
      return null;
    }
  }

  async register(email: string, password: string, name: string): Promise<{ user: User; accessToken: string; refreshToken: string }> {
    const existing = await this.userRepository.findByEmail(email);
    if (existing) {
      throw new ConflictException('Email already in use');
    }

    const passwordHash = this.hashPassword(password);
    const user = await this.userRepository.create({
      email,
      passwordHash,
      name,
      role: 'user',
    });

    const tokens = await this.generateTokens(user);
    return { user, ...tokens };
  }

  async login(email: string, password: string): Promise<{ user: User; accessToken: string; refreshToken: string }> {
    const existing = await this.userRepository.findByEmail(email);
    if (!existing || !this.verifyPassword(password, existing.passwordHash)) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const { passwordHash: _, ...user } = existing;
    const tokens = await this.generateTokens(user);
    return { user, ...tokens };
  }

  async generateTokens(user: User): Promise<{ accessToken: string; refreshToken: string }> {
    // 15 mins for access token, 7 days for refresh token
    const accessToken = this.signJwt(
      { sub: user._id, email: user.email, role: user.role },
      this.jwtSecret,
      15 * 60
    );

    const refreshToken = this.signJwt(
      { sub: user._id, email: user.email },
      this.refreshSecret,
      7 * 24 * 60 * 60
    );

    await this.redisService.set(`refresh:${user._id}`, refreshToken, 7 * 24 * 60 * 60);
    return { accessToken, refreshToken };
  }

  async refresh(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
    const payload = this.verifyJwt<{ sub: string; email: string }>(refreshToken, this.refreshSecret);
    if (!payload) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const stored = await this.redisService.get<string>(`refresh:${payload.sub}`);
    if (stored !== refreshToken) {
      throw new UnauthorizedException('Refresh token revoked or expired');
    }

    const user = await this.userRepository.findById(payload.sub);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return this.generateTokens(user);
  }

  async verifyToken(token: string): Promise<User | null> {
    const payload = this.verifyJwt<TokenPayload>(token, this.jwtSecret);
    if (!payload) {
      return null;
    }
    const cached = await this.redisService.get<User>(`user:${payload.sub}:public`);
    if (cached) {
      return cached;
    }
    const user = await this.userRepository.findById(payload.sub);
    if (user) {
      await this.redisService.set(`user:${user._id}:public`, user, 300); // 5 minutes TTL
    }
    return user;
  }
}
