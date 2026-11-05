import {
  Controller,
  Post,
  Patch,
  Get,
  Body,
  Param,
  ParseIntPipe,
  Req,
  UseGuards,
} from '@nestjs/common';

import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

import { UtilizacoesService } from './utilizacoes.service.js';
import { IniciarUtilizacaoDto } from './dto/iniciar-utilizacao.dto.js';
import { JwtGuard } from '../auth/jwt/jwt.guard.js';

interface RequestComUsuario {
  user: {
    id: number;
    email: string;
    tipoUsuario: string;
  };
}

@ApiTags('Utilizações')
@ApiBearerAuth()
@Controller('utilizacoes')
@UseGuards(JwtGuard)
export class UtilizacoesController {
  constructor(
    private readonly utilizacoesService: UtilizacoesService,
  ) {}

  @Post('iniciar')
  iniciar(
    @Req() req: RequestComUsuario,
    @Body() dados: IniciarUtilizacaoDto,
  ) {
    return this.utilizacoesService.iniciar(
      Number(req.user.id),
      dados,
    );
  }

  @Patch(':id/finalizar')
  finalizar(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: RequestComUsuario,
  ) {
    return this.utilizacoesService.finalizar(
      id,
      Number(req.user.id),
    );
  }

  @Get('meu-historico')
  meuHistorico(@Req() req: RequestComUsuario) {
    return this.utilizacoesService.meuHistorico(
      Number(req.user.id),
    );
  }
}
