import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { AuthService, USER_REPOSITORY } from './auth.service';
import { AuthController } from './auth.controller';
import { AuthGuard } from './guards/auth.guard';
import { UserDocumentClass, UserSchema } from './infrastructure/user.schema';
import { UserRepositoryImpl } from './infrastructure/user.repository';

@Module({
  imports: [
    ConfigModule,
    MongooseModule.forFeature([{ name: UserDocumentClass.name, schema: UserSchema }]),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    AuthGuard,
    {
      provide: USER_REPOSITORY,
      useClass: UserRepositoryImpl,
    },
  ],
  exports: [AuthService, AuthGuard, USER_REPOSITORY],
})
export class AuthModule {}
