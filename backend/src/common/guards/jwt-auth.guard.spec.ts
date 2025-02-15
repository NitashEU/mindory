import { ExecutionContext, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Test, TestingModule } from '@nestjs/testing';
import { JwtAuthGuard } from './jwt-auth.guard';
import { SupabaseService } from '../services/supabase.service';

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;
  let reflector: Reflector;
  let supabaseService: SupabaseService;

  const mockSupabaseService = {
    client: {
      auth: {
        getUser: jest.fn(),
      },
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtAuthGuard,
        Reflector,
        {
          provide: SupabaseService,
          useValue: mockSupabaseService,
        },
      ],
    }).compile();

    guard = module.get<JwtAuthGuard>(JwtAuthGuard);
    reflector = module.get<Reflector>(Reflector);
    supabaseService = module.get<SupabaseService>(SupabaseService);
  });

  const mockExecutionContext = (
    token?: string,
    params: any = {},
  ): ExecutionContext => ({
    switchToHttp: () => ({
      getRequest: () => ({
        headers: {
          authorization: token ? `Bearer ${token}` : undefined,
        },
        params,
      }),
    }),
    getHandler: () => ({}),
  } as ExecutionContext);

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should throw UnauthorizedException when no token is provided', async () => {
    const context = mockExecutionContext();
    await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
  });

  it('should throw UnauthorizedException when invalid token is provided', async () => {
    mockSupabaseService.client.auth.getUser.mockResolvedValueOnce({
      data: { user: null },
      error: new Error('Invalid token'),
    });

    const context = mockExecutionContext('invalid-token');
    await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
  });

  it('should pass when valid token and no permissions required', async () => {
    const mockUser = {
      id: 'user-123',
      email: 'test@example.com',
      user_metadata: {
        role: 'user',
        permissions: ['read'],
      },
    };

    mockSupabaseService.client.auth.getUser.mockResolvedValueOnce({
      data: { user: mockUser },
      error: null,
    });

    jest.spyOn(reflector, 'get').mockReturnValue([]);

    const context = mockExecutionContext('valid-token');
    const result = await guard.canActivate(context);
    expect(result).toBe(true);
  });

  it('should validate permissions correctly', async () => {
    const mockUser = {
      id: 'user-123',
      email: 'test@example.com',
      user_metadata: {
        role: 'admin',
        permissions: ['read', 'write'],
      },
    };

    mockSupabaseService.client.auth.getUser.mockResolvedValueOnce({
      data: { user: mockUser },
      error: null,
    });

    mockSupabaseService.client.from().select().eq().eq().single.mockResolvedValueOnce({
      data: { permission: ['read', 'write'] },
      error: null,
    });

    jest.spyOn(reflector, 'get').mockReturnValue(['read']);

    const context = mockExecutionContext('valid-token', { resourceId: '123' });
    const result = await guard.canActivate(context);
    expect(result).toBe(true);
  });

  it('should throw ForbiddenException when insufficient permissions', async () => {
    const mockUser = {
      id: 'user-123',
      email: 'test@example.com',
      user_metadata: {
        role: 'user',
        permissions: ['read'],
      },
    };

    mockSupabaseService.client.auth.getUser.mockResolvedValueOnce({
      data: { user: mockUser },
      error: null,
    });

    mockSupabaseService.client.from().select().eq().eq().single.mockResolvedValueOnce({
      data: { permission: ['read'] },
      error: null,
    });

    jest.spyOn(reflector, 'get').mockReturnValue(['write']);

    const context = mockExecutionContext('valid-token', { resourceId: '123' });
    await expect(guard.canActivate(context)).rejects.toThrow(ForbiddenException);
  });
});