import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';
import { CommonModule } from './common/common.module';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { CodebaseInputModule } from './modules/codebase-input/codebase-input.module';
import { RepositoriesModule } from './modules/repositories/repositories.module';
import { DatabaseModule } from './database/database.module';
import supabaseConfig from './config/supabase.config';
import lancedbConfig from './config/lancedb.config';
import neo4jConfig from './config/neo4j.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [supabaseConfig, lancedbConfig, neo4jConfig],
      validationSchema: Joi.object({
        LANCEDB_URI: Joi.string().default('./data/lancedb'),
      }),
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
