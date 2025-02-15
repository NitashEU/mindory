import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../../common/services/supabase.service';
import { Neo4jService } from '../../database/neo4j.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UserService {
  constructor(
    private readonly supabase: SupabaseService,
    private readonly neo4jService: Neo4jService
  ) {}

  async createUser(userData: CreateUserDto) {
    // Keep auth in Supabase
    const { data: authData, error: authError } = await this.supabase.client
      .from("users")
      .select()
      .eq("id", userData.id)
      .single();

    if (authError) throw authError;

    // Store user data in Neo4j
    const result = await this.neo4jService.write(`
      CREATE (u:User {
      id: $id,
      email: $email,
      username: $username,
      createdAt: datetime(),
      updatedAt: datetime()
      })
      RETURN u
    `, {
      id: userData.id,
      email: userData.email,
      username: userData.username
    });

    return result.records[0].get('u').properties;
  }

  async findAllUsers() {
    const result = await this.neo4jService.read(`
      MATCH (u:User)
      RETURN u
      ORDER BY u.createdAt DESC
    `);

    return result.records.map(record => record.get('u').properties);
  }

  async findUserById(id: string) {
    const result = await this.neo4jService.read(`
      MATCH (u:User {id: $id})
      RETURN u
    `, { id });

    if (result.records.length === 0) {
      return null;
    }

    return result.records[0].get('u').properties;
  }

  async updateUser(id: string, updatedData: UpdateUserDto) {
    const result = await this.neo4jService.write(`
      MATCH (u:User {id: $id})
      SET u += $updates, u.updatedAt = datetime()
      RETURN u
    `, { 
      id,
      updates: updatedData
    });

    if (result.records.length === 0) {
      throw new Error('User not found');
    }

    return result.records[0].get('u').properties;
  }
}
