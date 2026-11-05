import {
  Controller,
  Post,
  Patch,
  Get,
  Body,
  UseGuards,
  Param,
  ParseIntPipe,
  Req,
  ForbiddenException,
} from '@nestjs/common';

import {
  ApiTags,
  ApiBearerAuth,
} from '@nestjs/swagger';

import type { Request } from 'express';

import { ManutencoesService } from './manutencoes.service.js';
import { CriarManutencaoDto } from './dto/criar-manutencao.dto.js';

import { JwtGuard } from '../auth/jwt/jwt.guard.js';

import { Manutencao } from '../entities/manutencao.entity.js';

interface RequestComUsuario extends Request {
  user: {
    id: number;
    email: string;
    tipoUsuario: string;
  };
}

@ApiTags('Manutenções')
@ApiBearerAuth()
@Controller('manutencoes')
@UseGuards(JwtGuard)
export class ManutencoesController {
  constructor(
    private readonly manutencoesService: ManutencoesService,
  ) {}

  @Post()
  agendar(
    @Body() dados: CriarManutencaoDto,
    @Req() req: RequestComUsuario,
  ): Promise<Manutencao> {
    if (req.user.tipoUsuario !== 'ADMIN') {
      throw new ForbiddenException(
        'Apenas administradores podem agendar manutenções.',
      );
    }

    return this.manutencoesService.agendar(dados);
  }

  @Patch(':id/iniciar')
  iniciar(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: RequestComUsuario,
  ): Promise<Manutencao> {
    if (req.user.tipoUsuario !== 'ADMIN') {
      throw new ForbiddenException(
        'Apenas administradores podem iniciar manutenções.',
      );
    }

    return this.manutencoesService.iniciar(id);
  }

  @Patch(':id/concluir')
  concluir(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: RequestComUsuario,
  ): Promise<Manutencao> {
    if (req.user.tipoUsuario !== 'ADMIN') {
      throw new ForbiddenException(
        'Apenas administradores podem concluir manutenções.',
      );
    }

    return this.manutencoesService.concluir(id);
  }

  @Get()
  listarTodas(): Promise<Manutencao[]> {
    return this.manutencoesService.listarTodas();
  }

  @Patch(':id/cancelar')
  cancelar(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: RequestComUsuario,
  ): Promise<Manutencao> {
    if (req.user.tipoUsuario !== 'ADMIN') {
      throw new ForbiddenException(
        'Apenas administradores podem cancelar manutenções.',
      );
    }

    return this.manutencoesService.cancelar(id);
  }
}