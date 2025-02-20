import { Injectable } from '@nestjs/common';
import { ConfigResponse, HealthCheckResponse, VersionResponse } from './interfaces/health.interface';

@Injectable()
export class HealthService {
  async checkHealth(): Promise<HealthCheckResponse> {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      done: true,
      details: {
        database: true,
        cache: true,
        services: {
          api: true
        }
      }
    };
  }

  async getConfig(): Promise<ConfigResponse> {
    return {
      response: 'hello_skcd'
    };
  }

  async getVersion(): Promise<VersionResponse> {
    return {
      version_hash: process.env.BINARY_VERSION_HASH || 'development',
      package_version: process.env.npm_package_version || '0.0.0'
    };
  }
}
