import supabaseConfig from '../config/supabase.config';
import { ConfigModule } from '@nestjs/config';
import { HttpExceptionFilter } from './filters/http-exception.filter';
import { LoggingInterceptor } from './interceptors/logging.interceptor';
import { Module } from '@nestjs/common';
import { SupabaseService } from './services/supabase.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [supabaseConfig],
      isGlobal: true,
    }),
  ],
  providers: [LoggingInterceptor, HttpExceptionFilter, SupabaseService],
  exports: [LoggingInterceptor, HttpExceptionFilter, SupabaseService],
})
export class CommonModule {}
