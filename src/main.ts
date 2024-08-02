import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { AppConfig } from './config/config.schema';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    const configService = app.get<ConfigService<AppConfig>>(ConfigService);
    const port = configService.get('appPort');

    await app.listen(port);
}

bootstrap();
