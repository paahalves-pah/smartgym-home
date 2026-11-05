import {
  Body,
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Param,
  ParseIntPipe,
  UseGuards,
  Req,
  ForbiddenException,
} from '@nestjs/common';

import { ApiBearerAuth } from '@nestjs/swagger';
import type { Request } from 'express';

import { UsuariosService } from './usuarios.service.js';
import { CriarUsuarioDto } from './dto/criar-usuario.dto.js';
import { AtualizarUsuarioDto } from './dto/atualizar-usuario.dto.js';
import { JwtGuard } from '../auth/jwt/jwt.guard.js';

interface RequestComUsuario extends Request {
  user: {
    id: number;
    email: string;
    tipoUsuario: string;
  };
}

@Controller('usuarios')
export class UsuariosController {
  constructor(
    private readonly usuariosService: UsuariosService,
  ) {}

  @Post()
  criar(@Body() dados: CriarUsuarioDto) {
    return this.usuariosService.criar(dados);
  }

  @UseGuards(JwtGuard)
  @ApiBearerAuth()
  @Get()
  listar(@Req() req: RequestComUsuario) {
    if (req.user.tipoUsuario !== 'ADMIN') {
      throw new ForbiddenException(
        'Apenas administradores podem listar usuários.',
      );
    }

    return this.usuariosService.listar();
  }

  @UseGuards(JwtGuard)
  @ApiBearerAuth()
  @Get(':id')
  buscarPorId(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: RequestComUsuario,
  ) {
    if (
      req.user.tipoUsuario !== 'ADMIN' &&
      req.user.id !== id
    ) {
      throw new ForbiddenException(
        'Você não tem permissão para consultar este usuário.',
      );
    }

    return this.usuariosService.buscarPorId(id);
  }

  @UseGuards(JwtGuard)
  @ApiBearerAuth()
  @Put(':id')
  atualizar(
    @Param('id', ParseIntPipe) id: number,
    @Body() dados: AtualizarUsuarioDto,
    @Req() req: RequestComUsuario,
  ) {
    if (
      req.user.tipoUsuario !== 'ADMIN' &&
      req.user.id !== id
    ) {
      throw new ForbiddenException(
        'Você não tem permissão para atualizar este usuário.',
      );
    }

    return this.usuariosService.atualizar(id, dados);
  }

  @UseGuards(JwtGuard)
  @ApiBearerAuth()
  @Delete(':id')
  excluir(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: RequestComUsuario,
  ) {
    if (req.user.tipoUsuario !== 'ADMIN') {
      throw new ForbiddenException(
        'Apenas administradores podem excluir usuários.',
      );
    }

    return this.usuariosService.excluir(id);
  }
}