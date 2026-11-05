import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { DashboardController } from './dashboard.controller.js';
import { DashboardService } from './dashboard.service.js';

import { Equipamento } from '../entities/equipamento.entity.js';
import { Manutencao } from '../entities/manutencao.entity.js';
import { Utilizacao } from '../entities/utilizacao.entity.js';
import { Usuario } from '../entities/usuario.entity.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Equipamento,
      Manutencao,
      Utilizacao,
      Usuario,
    ]),
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}