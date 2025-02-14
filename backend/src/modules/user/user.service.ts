import { CreateUserDto } from './dto/create-user.dto';
import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../../common/services/supabase.service';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UserService {
  constructor(private readonly supabase: SupabaseService) {}

  async createUser(userData: CreateUserDto) {
    const { data, error } = await this.supabase.client
      .from("users")
      .insert([userData])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async findAllUsers() {
    const { data, error } = await this.supabase.client
      .from("users")
      .select("*");

    if (error) throw error;
    return data;
  }

  async findUserById(id: number) {
    const { data, error } = await this.supabase.client
      .from("users")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;
    return data;
  }

  async updateUser(id: number, updatedData: UpdateUserDto) {
    const { data, error } = await this.supabase.client
      .from("users")
      .update(updatedData)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}
