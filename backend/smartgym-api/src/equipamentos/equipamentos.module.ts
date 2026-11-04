import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { EquipamentosController } from './equipamentos.controller.js';
import { EquipamentosService } from './equipamentos.service.js';
import { Equipamento } from '../entities/equipamento.entity.js';

@Module({
  imports: [TypeOrmModule.forFeature([Equipamento])],
  controllers: [EquipamentosController],
  providers: [EquipamentosService],
})
export class EquipamentosModule {}

