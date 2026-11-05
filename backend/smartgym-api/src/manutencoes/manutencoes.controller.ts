import {
  Controller,
  Post,
  Patch,
  Get,
  Body,
  UseGuards,
  Param,
  ParseIntPipe,
} from '@nestjs/common';

import { ManutencoesService } from './manutencoes.service.js';
import { CriarManutencaoDto } from './dto/criar-manutencao.dto.js';

import { JwtGuard } from '../auth/jwt/jwt.guard.js';

import { Manutencao } from '../entities/manutencao.entity.js';

@Controller('manutencoes')
@UseGuards(JwtGuard)
export class ManutencoesController {
  constructor(
    private readonly manutencoesService: ManutencoesService,
  ) {}

  @Post()
  agendar(
    @Body() dados: CriarManutencaoDto,
  ): Promise<Manutencao> {
    return this.manutencoesService.agendar(dados);
  }

  @Patch(':id/iniciar')
  iniciar(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<Manutencao> {
    return this.manutencoesService.iniciar(id);
  }

  @Patch(':id/concluir')
  concluir(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<Manutencao> {
    return this.manutencoesService.concluir(id);
  }

  @Get()
  listarTodas(): Promise<Manutencao[]> {
    return this.manutencoesService.listarTodas();
  }

  @Patch(':id/cancelar')
  cancelar(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<Manutencao> {
    return this.manutencoesService.cancelar(id);
  }
}