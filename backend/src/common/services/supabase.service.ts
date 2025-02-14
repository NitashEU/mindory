import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Injectable, OnModuleInit } from '@nestjs/common';

@Injectable()
export class SupabaseService implements OnModuleInit {
  private supabase: SupabaseClient;

  constructor(private configService: ConfigService) {}

  onModuleInit() {
    const supabaseUrl = this.configService.getOrThrow<string>("supabase.url");
    const supabaseKey = this.configService.getOrThrow<string>("supabase.key");

    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  get client() {
    if (!this.supabase) {
      throw new Error("Supabase client not initialized");
    }
    return this.supabase;
  }
}
