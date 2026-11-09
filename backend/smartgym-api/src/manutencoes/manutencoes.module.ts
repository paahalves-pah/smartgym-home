import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Manutencao } from '../entities/manutencao.entity.js';
import { Equipamento } from '../entities/equipamento.entity.js';
import { Utilizacao } from '../entities/utilizacao.entity.js';
import { Usuario } from '../entities/usuario.entity.js';

import { ManutencoesService } from './manutencoes.service.js';
import { ManutencoesController } from './manutencoes.controller.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Manutencao,
      Equipamento,
      Utilizacao,
      Usuario,
    ]),
  ],
  providers: [ManutencoesService],
  exports: [ManutencoesService],
  controllers: [ManutencoesController],
})
export class ManutencoesModule {}