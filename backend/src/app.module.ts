import { AuthModule } from './modules/auth/auth.module';
import { CodebaseInputModule } from './modules/codebase-input/codebase-input.module';
import { CommonModule } from './common/common.module';
import { ConfigModule } from '@nestjs/config';
import { Module } from '@nestjs/common';
import { UserModule } from './modules/user/user.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AuthModule,
    UserModule,
    CommonModule,
    CodebaseInputModule,
  ],
})
export class AppModule {}
