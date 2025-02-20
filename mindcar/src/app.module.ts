import { AgenticModule } from './modules/agentic/agentic.module';
import { ClsModule } from 'nestjs-cls';
import { ConfigModule as AppConfigModule } from './modules/config/config.module';
import { ConfigModule } from '@nestjs/config';
import { HealthModule } from './modules/health/health.module';
import { Module } from '@nestjs/common';

@Module({
  imports: [
    ConfigModule.forRoot(), // NestJS Config
    ClsModule.forRoot({
      middleware: {
        // automatically mount the
        // ClsMiddleware for all routes
        mount: true,
        saveRes: true,
        // and use the setup method to
        // provide default store values.
        setup: (cls, req) => {
          cls.set('session');
        },
      },
    }),
    AgenticModule,
    HealthModule,
    AppConfigModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
