import { Injectable } from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  private users = []; // This should be replaced with a proper user repository

  async validateUser(loginDto: LoginDto): Promise<any> {
    const user = this.users.find(user => user.username === loginDto.username && user.password === loginDto.password);
    return user ? user : null;
  }

  async registerUser(registerDto: RegisterDto): Promise<any> {
    const newUser = { id: Date.now(), ...registerDto };
    this.users.push(newUser);
    return newUser;
  }
}