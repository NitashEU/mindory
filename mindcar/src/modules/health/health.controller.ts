import {
  Body,
  Controller,
  Get,
  Post
  } from '@nestjs/common';
import { HealthService } from './health.service';

@Controller('api')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get('health')
  health() {
    return this.healthService.checkHealth();
  }

  @Get('version')
  version() {
    return this.healthService.checkHealth();
  }

  @Post('new_exchange')
  new_exchange(@Body() body: any) {
    return {
      exchange_id: '1',
    };
  }
}
