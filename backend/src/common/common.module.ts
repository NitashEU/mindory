import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SupabaseService, VoyageService } from './services';
import { HttpExceptionFilter } from './filters/http-exception.filter';
import { LoggingInterceptor } from './interceptors/logging.interceptor';
import supabaseConfig from '../config/supabase.config';
import neo4jConfig from '../config/neo4j.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [supabaseConfig, neo4jConfig],
      isGlobal: true,
    }),
  ],
  providers: [
    SupabaseService,
    VoyageService,
    LoggingInterceptor,
    HttpExceptionFilter,
  ],
  exports: [
    SupabaseService,
    VoyageService,
    LoggingInterceptor,
    HttpExceptionFilter,
  ],
})
export class CommonModule {}

