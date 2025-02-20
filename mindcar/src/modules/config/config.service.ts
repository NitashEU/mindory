import { Injectable } from '@nestjs/common';

@Injectable()
export class ConfigService {
  getConfig() {
    return {
      response: 'hello_skcd',
    };
  }
  reachTheDevs() {}
  getVersion() {}
}