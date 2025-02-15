import supabaseConfig from '../config/supabase.config';
import { ConfigModule } from '@nestjs/config';
import { HttpExceptionFilter } from './filters/http-exception.filter';
import { LoggingInterceptor } from './interceptors/logging.interceptor';
import { Module } from '@nestjs/common';
import { SupabaseService } from './services/supabase.service';
import { VoyageService } from './services/voyage.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [supabaseConfig],
      isGlobal: true,
    }),
  ],
  providers: [LoggingInterceptor, HttpExceptionFilter, SupabaseService, VoyageService],
  exports: [LoggingInterceptor, HttpExceptionFilter, SupabaseService, VoyageService],
})
export class CommonModule { }
