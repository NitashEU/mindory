import * as express from 'express';
import { AgenticModule } from './modules/agentic/agentic.module';
import { ClsModule } from 'nestjs-cls';
import { ConfigModule as AppConfigModule } from './modules/config/config.module';
import { ConfigModule } from '@nestjs/config';
import { HealthModule } from './modules/health/health.module';
import { MCSession } from './modules/shared/session/session';
import { Module } from '@nestjs/common';
import { SharedModule } from './shared/shared.module';

@Module({
  imports: [
    ClsModule.forRoot({
      global: true,
      middleware: {
        // automatically mount the
        // ClsMiddleware for all routes
        mount: true,
        saveRes: true,
        // and use the setup method to
        // provide default store values.
        setup: (cls, req: express.Request, res: express.Response) => {
          const session_key = `session_${req.body.session_id}`;
          let session = cls.get('session');
          if (!session) {
            session = new MCSession(req.body.session_id);
            cls.set('session', session);
          }
          session.setResponse(res);
        },
      },
    }),
    ConfigModule.forRoot(), // NestJS Config
    SharedModule,
    AgenticModule,
    HealthModule,
    AppConfigModule,
  ],
  exports: [],
  controllers: [],
  providers: [],
})
export class AppModule {}
