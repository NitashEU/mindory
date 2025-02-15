import { Reflector } from "@nestjs/core";
import { SupabaseService } from "../services/supabase.service";
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  ForbiddenException,
} from "@nestjs/common";

export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  permissions: string[];
}

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly supabase: SupabaseService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const request = context.switchToHttp().getRequest();
      const token = this.extractTokenFromHeader(request);

      if (!token) {
        throw new UnauthorizedException("Missing authentication token");
      }

      // Validate token with Supabase
      const {
        data: { user },
        error,
      } = await this.supabase.client.auth.getUser(token);

      if (error || !user) {
        throw new UnauthorizedException("Invalid authentication token");
      }

      // Get required permissions from decorator metadata
      const requiredPermissions =
        this.reflector.get<string[]>("permissions", context.getHandler()) || [];

      // Get resource ID from request parameters
      const resourceId = this.extractResourceId(request);

      // Validate permissions if required
      if (requiredPermissions.length > 0) {
        await this.validatePermissions(
          user.id,
          requiredPermissions,
          resourceId
        );
      }

      // Attach user to request for later use
      request.user = {
        id: user.id,
        email: user.email,
        role: user.user_metadata?.role,
        permissions: user.user_metadata?.permissions || [],
      };

      return true;
    } catch (error) {
      if (
        error instanceof UnauthorizedException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }
      throw new UnauthorizedException("Authentication failed");
    }
  }

  private extractTokenFromHeader(request: any): string | undefined {
    const [type, token] = request.headers.authorization?.split(" ") ?? [];
    return type === "Bearer" ? token : undefined;
  }

  private extractResourceId(request: any): string | undefined {
    // Extract resource ID from route parameters
    const params = request.params;
    const possibleIdFields = ["id", "resourceId", "userId"];

    for (const field of possibleIdFields) {
      if (params[field]) {
        return params[field];
      }
    }
    return undefined;
  }

  private async validatePermissions(
    userId: string,
    requiredPermissions: string[],
    resourceId?: string
  ): Promise<void> {
    // Query Supabase for user permissions on the specific resource
    const { data: permissions, error } = await this.supabase.client
      .from("user_permissions")
      .select("permission")
      .eq("user_id", userId)
      .eq("resource_id", resourceId || "*")
      .single();

    if (error) {
      throw new ForbiddenException("Failed to validate permissions");
    }

    const hasRequiredPermissions = requiredPermissions.every((permission) =>
      permissions.permission.includes(permission)
    );

    if (!hasRequiredPermissions) {
      throw new ForbiddenException("Insufficient permissions");
    }
  }
}
