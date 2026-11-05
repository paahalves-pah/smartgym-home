import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
  Req,
  ForbiddenException,
} from '@nestjs/common';

import {
  ApiTags,
  ApiBearerAuth,
} from '@nestjs/swagger';

import type { Request } from 'express';

import { JwtGuard } from '../auth/jwt/jwt.guard.js';

import { EquipamentosService } from './equipamentos.service.js';

import {
  CriarEquipamentoDto,
  AtualizarEquipamentoDto,
} from './dto/equipamento.dto.js';

interface RequestComUsuario extends Request {
  user: {
    id: number;
    email: string;
    tipoUsuario: string;
  };
}

@ApiTags('Equipamentos')
@ApiBearerAuth()
@UseGuards(JwtGuard)
@Controller('equipamentos')
export class EquipamentosController {
  constructor(
    private readonly equipamentosService: EquipamentosService,
  ) {}

  @Post()
  criar(
    @Body() dados: CriarEquipamentoDto,
    @Req() req: RequestComUsuario,
  ) {
    if (req.user.tipoUsuario !== 'ADMIN') {
      throw new ForbiddenException(
        'Apenas administradores podem cadastrar equipamentos.',
      );
    }

    return this.equipamentosService.criar(dados);
  }

  @Get()
  listar() {
    return this.equipamentosService.listar();
  }

  @Get(':id')
  buscarPorId(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.equipamentosService.buscarPorId(id);
  }

  @Put(':id')
  atualizar(
    @Param('id', ParseIntPipe) id: number,
    @Body() dados: AtualizarEquipamentoDto,
    @Req() req: RequestComUsuario,
  ) {
    if (req.user.tipoUsuario !== 'ADMIN') {
      throw new ForbiddenException(
        'Apenas administradores podem atualizar equipamentos.',
      );
    }

    return this.equipamentosService.atualizar(id, dados);
  }

  @Delete(':id')
  excluir(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: RequestComUsuario,
  ) {
    if (req.user.tipoUsuario !== 'ADMIN') {
      throw new ForbiddenException(
        'Apenas administradores podem excluir equipamentos.',
      );
    }

    return this.equipamentosService.excluir(id);
  }
}
