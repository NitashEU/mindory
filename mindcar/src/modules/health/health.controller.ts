import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { HealthCheckResponse, ConfigResponse, VersionResponse } from './interfaces/health.interface';
import { HealthService } from './health.service';

@ApiTags('Health')
@Controller()
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get('api/health')
  @ApiOperation({ summary: 'Health check endpoint' })
  @ApiResponse({ 
    status: 200,
    description: 'Health check successful',
    type: HealthCheckResponse
  })
  async health(): Promise<HealthCheckResponse> {
    return this.healthService.checkHealth();
  }

  @Get('api/config')
  @ApiOperation({ summary: 'Get configuration' })
  @ApiResponse({
    status: 200,
    description: 'Configuration retrieved successfully',
    type: ConfigResponse
  })
  async getConfig(): Promise<ConfigResponse> {
    return this.healthService.getConfig();
  }

  @Get('api/version')
  @ApiOperation({ summary: 'Get version information' })
  @ApiResponse({
    status: 200,
    description: 'Version information retrieved successfully',
    type: VersionResponse
  })
  async getVersion(): Promise<VersionResponse> {
    return this.healthService.getVersion();
  }
}