
import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Req,
  UseGuards,
} from '@nestjs/common';

import {
  ApiBearerAuth,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

import { JwtGuard } from '../auth/jwt/jwt.guard.js';
import { ConversasService } from './conversas.service.js';

interface RequestComUsuario {
  user: {
    id: number;
  };
}

@ApiTags('Conversas do FitBot')
@ApiBearerAuth()
@Controller('inteligencia/conversas')
@UseGuards(JwtGuard)
export class ConversasController {
  constructor(
    private readonly conversasService: ConversasService,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'Listar conversas do usuário autenticado',
  })
  listar(@Req() req: RequestComUsuario) {
    return this.conversasService.listarConversas(
      Number(req.user.id),
    );
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Consultar mensagens de uma conversa',
  })
  buscar(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: RequestComUsuario,
  ) {
    return this.conversasService.buscarHistorico(
      id,
      Number(req.user.id),
    );
  }
}
