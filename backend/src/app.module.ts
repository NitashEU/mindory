import { Module } from '@nestjs/common';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { CommonModule } from './common/common.module';

@Module({
  imports: [AuthModule, UserModule, CommonModule],
})
export class AppModule {}