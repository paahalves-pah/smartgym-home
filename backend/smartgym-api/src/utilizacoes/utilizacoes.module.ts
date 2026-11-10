
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UtilizacoesController } from './utilizacoes.controller.js';
import { UtilizacoesService } from './utilizacoes.service.js';

import { Utilizacao } from '../entities/utilizacao.entity.js';
import { Equipamento } from '../entities/equipamento.entity.js';
import { Usuario } from '../entities/usuario.entity.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Utilizacao,
      Equipamento,
      Usuario,
    ]),
  ],
  controllers: [UtilizacoesController],
  providers: [UtilizacoesService],
  exports: [UtilizacoesService],
})
export class UtilizacoesModule {}
