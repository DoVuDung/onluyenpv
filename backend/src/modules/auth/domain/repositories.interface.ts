import { User, Role } from '@onluyenphongvan/types';

export interface IUserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<(User & { passwordHash: string }) | null>;
  create(data: { email: string; passwordHash: string; name: string; role?: Role }): Promise<User>;
}
