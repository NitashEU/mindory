import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CommonModule } from './common/common.module';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { CodebaseInputModule } from './modules/codebase-input/codebase-input.module';
import { RepositoriesModule } from './modules/repositories/repositories.module';
import { DatabaseModule } from './database/database.module';
import supabaseConfig from './config/supabase.config';
import lancedbConfig from './config/lancedb.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [supabaseConfig, lancedbConfig],
    }),
    CommonModule,
    DatabaseModule,
    AuthModule,
    UserModule,
    CodebaseInputModule,
    RepositoriesModule,
  ],
})
export class AppModule {}
