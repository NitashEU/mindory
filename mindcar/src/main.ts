import { AppModule } from './app.module';
import { NestFactory } from '@nestjs/core';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // add logging middleware for all requests
  app.use((req, res, next) => {
    // ignore version and health
    if (req.url === '/api/version' || req.url === '/api/health') {
      return next();
    }
    console.log('Request: ', req.url);
    next();
  });
  // add logging middleware for all responses
  app.use((req, res, next) => {
    if (req.url === '/api/version' || req.url === '/api/health') {
      return next();
    }
    const oldSend = res.send;
    res.send = function (body) {
      console.log('Response: ', body);
      oldSend.call(this, body);
    };
    next();
  });
  await app.listen(42424, '127.0.0.1');
}
bootstrap();
