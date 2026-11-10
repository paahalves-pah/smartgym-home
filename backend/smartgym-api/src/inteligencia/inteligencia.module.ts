
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { InteligenciaController } from './inteligencia.controller.js';
import { InteligenciaService } from './inteligencia.service.js';

import { ConversasModule } from '../conversas/conversas.module.js';
import { UtilizacoesModule } from '../utilizacoes/utilizacoes.module.js';
import { Equipamento } from '../entities/equipamento.entity.js';

@Module({
  imports: [
    ConfigModule,
    ConversasModule,
    UtilizacoesModule,
    TypeOrmModule.forFeature([Equipamento]),
  ],
  controllers: [InteligenciaController],
  providers: [InteligenciaService],
})
export class InteligenciaModule {}
