import { Injectable } from '@nestjs/common';

@Injectable()
export class HealthService {
  async checkHealth() {
    return {
      done: true,
    };
  }
}
