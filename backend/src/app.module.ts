import { Module } from '@nestjs/common';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { CommonModule } from './common/common.module';
import { CodebaseInputModule } from './modules/codebase-input/codebase-input.module';

@Module({
  imports: [AuthModule, UserModule, CommonModule, CodebaseInputModule],
})
export class AppModule {}