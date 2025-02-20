import { Controller, Get } from '@nestjs/common';
import { ConfigService } from './config.service';

@Controller('api')
export class ConfigController {
  constructor(private readonly configService: ConfigService) {}

  @Get('config')
  getConfig() {
    return this.configService.getConfig();
  }

  @Get('reach_the_devs')
  reachTheDevs() {
    return this.configService.reachTheDevs();
  }

  @Get('version')
  getVersion() {
    return this.configService.getVersion();
  }
}