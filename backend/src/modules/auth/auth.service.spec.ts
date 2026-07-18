import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { IUserRepository } from './domain/repositories.interface';
import { RedisService } from '../../shared/redis/redis.service';
import { User } from '@onluyenphongvan/types';

describe('AuthService', () => {
  let authService: AuthService;
  let mockUserRepo: jest.Mocked<IUserRepository>;
  let mockRedisService: jest.Mocked<RedisService>;
  let mockConfigService: jest.Mocked<ConfigService>;

  beforeEach(() => {
    mockUserRepo = {
      findById: jest.fn(),
      findByEmail: jest.fn(),
      create: jest.fn(),
    };

    mockRedisService = {
      get: jest.fn(),
      set: jest.fn(),
      del: jest.fn(),
      delByPrefix: jest.fn(),
      getClient: jest.fn(),
      onModuleDestroy: jest.fn(),
    } as unknown as jest.Mocked<RedisService>;

    mockConfigService = {
      get: jest.fn().mockReturnValue('test_secret_key_1234567890'),
    } as unknown as jest.Mocked<ConfigService>;

    authService = new AuthService(mockUserRepo, mockRedisService, mockConfigService);
  });

  it('should register a new user successfully and return access and refresh tokens', async () => {
    mockUserRepo.findByEmail.mockResolvedValue(null);
    const createdUser: User = {
      _id: 'user_1',
      email: 'test@example.com',
      name: 'Test Engineer',
      role: 'user',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    mockUserRepo.create.mockResolvedValue(createdUser);

    const result = await authService.register('test@example.com', 'password123', 'Test Engineer');

    expect(result.user.email).toBe('test@example.com');
    expect(result.accessToken).toBeDefined();
    expect(result.refreshToken).toBeDefined();
    expect(mockRedisService.set).toHaveBeenCalled();
  });

  it('should throw ConflictException if email is already registered', async () => {
    mockUserRepo.findByEmail.mockResolvedValue({
      _id: 'user_1',
      email: 'existing@example.com',
      name: 'Existing',
      role: 'user',
      passwordHash: 'salt:hash',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await expect(
      authService.register('existing@example.com', 'password123', 'New Name')
    ).rejects.toThrow(ConflictException);
  });

  it('should throw UnauthorizedException when logging in with invalid password', async () => {
    mockUserRepo.findByEmail.mockResolvedValue({
      _id: 'user_1',
      email: 'test@example.com',
      name: 'User',
      role: 'user',
      passwordHash: 'invalid_salt:invalid_hash',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await expect(
      authService.login('test@example.com', 'wrongpassword')
    ).rejects.toThrow(UnauthorizedException);
  });
});
