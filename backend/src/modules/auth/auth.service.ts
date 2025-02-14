import { Injectable } from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { SupabaseService } from '../../common/services/supabase.service';

@Injectable()
export class AuthService {
  constructor(private supabase: SupabaseService) {}

  async validateUser(loginDto: LoginDto) {
    const { data, error } = await this.supabase.client.auth.signInWithPassword({
      email: loginDto.username,
      password: loginDto.password,
    });

    if (error) throw error;
    return data;
  }

  async registerUser(registerDto: RegisterDto) {
    const { data, error } = await this.supabase.client.auth.signUp({
      email: registerDto.email,
      password: registerDto.password,
      options: {
        data: {
          username: registerDto.username,
        },
      },
    });

    if (error) throw error;
    return data;
  }
}
