import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService {
	private supabase: SupabaseClient;

	constructor(private configService: ConfigService) {
		const supabaseUrl = this.configService.getOrThrow('supabase.url');
		const supabaseKey = this.configService.getOrThrow('supabase.key');
		this.supabase = createClient(supabaseUrl, supabaseKey);
	}

	get client(): SupabaseClient {
		return this.supabase;
	}
}

