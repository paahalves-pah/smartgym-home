
import {
  Body,
  Controller,
  Post,
} from '@nestjs/common';

import { UsuariosService } from './usuarios.service.js';
import { CriarUsuarioDto } from './dto/criar-usuario.dto.js';

@Controller('usuarios')
export class UsuariosController {
  constructor(
    private readonly usuariosService: UsuariosService,
  ) {}

  @Post()
  criar(@Body() dados: CriarUsuarioDto) {
    return this.usuariosService.criar(dados);
  }
}
