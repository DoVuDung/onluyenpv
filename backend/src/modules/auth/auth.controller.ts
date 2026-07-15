import { Controller, Post, Get, Body, Req, UseGuards } from '@nestjs/common';
import { FastifyRequest } from 'fastify';
import { z } from 'zod';
import { User } from '@onluyenphongvan/types';
import { AuthService } from './auth.service';
import { AuthGuard } from './guards/auth.guard';
import { ZodValidationPipe } from '../../shared/pipes/zod-validation.pipe';

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(2),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const refreshSchema = z.object({
  refreshToken: z.string().min(1),
});

interface RequestWithUser extends FastifyRequest {
  user?: User;
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(
    @Body(new ZodValidationPipe(registerSchema)) body: z.infer<typeof registerSchema>
  ): Promise<{ user: User; accessToken: string; refreshToken: string }> {
    return this.authService.register(body.email, body.password, body.name);
  }

  @Post('login')
  async login(
    @Body(new ZodValidationPipe(loginSchema)) body: z.infer<typeof loginSchema>
  ): Promise<{ user: User; accessToken: string; refreshToken: string }> {
    return this.authService.login(body.email, body.password);
  }

  @Post('refresh')
  async refresh(
    @Body(new ZodValidationPipe(refreshSchema)) body: z.infer<typeof refreshSchema>
  ): Promise<{ accessToken: string; refreshToken: string }> {
    return this.authService.refresh(body.refreshToken);
  }

  @UseGuards(AuthGuard)
  @Get('me')
  async me(@Req() req: RequestWithUser): Promise<User> {
    if (!req.user) {
      throw new Error('User missing from request context');
    }
    return req.user;
  }
}
