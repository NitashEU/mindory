import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HttpExceptionFilter } from './filters/http-exception.filter';
import { LoggingInterceptor } from './interceptors/logging.interceptor';
import { SupabaseService } from './services/supabase.service';
import { VoyageService } from './services/voyage.service';
import supabaseConfig from '../config/supabase.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [supabaseConfig],
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
