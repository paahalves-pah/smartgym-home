import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { InteligenciaController } from './inteligencia.controller.js';
import { InteligenciaService } from './inteligencia.service.js';

@Module({
  imports: [ConfigModule],
  controllers: [InteligenciaController],
  providers: [InteligenciaService],
})
export class InteligenciaModule {}