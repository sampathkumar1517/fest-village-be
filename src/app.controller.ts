import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  /** Lightweight liveness for external keep-alive cron (no auth, no DB). */
  @Get('health')
  health() {
    return { status: 'ok' };
  }
}
