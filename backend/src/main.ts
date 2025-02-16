import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS
  app.enableCors();

  // Add validation pipe and exception filter
  app.useGlobalPipes(new ValidationPipe({
    transform: true,
    whitelist: true,
    forbidNonWhitelisted: true,
  }));
  app.useGlobalFilters(new HttpExceptionFilter());

  // Swagger setup
  const config = new DocumentBuilder()
    .setTitle("Codebase API")
    .setDescription("The Codebase API description")
    .setVersion("1.0")
    .addBearerAuth()
    .addTag("auth")
    .addTag("users")
    .addTag("codebase-input")
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("swagger", app, document, {
    jsonDocumentUrl: "/swagger-json",
    yamlDocumentUrl: "/swagger-yaml",
  });

  // Set global prefix AFTER Swagger setup
  app.setGlobalPrefix("api");

  const port = process.env.PORT || 3000;
  await app.listen(port, "0.0.0.0");

  // Log the URLs
  const serverUrl = await app.getUrl();
  console.log(`Application is running on: ${serverUrl}`);
  console.log(`Swagger documentation is available at: ${serverUrl}/swagger`);
}

bootstrap();
