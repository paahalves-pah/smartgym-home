
import {
  Body,
  Controller,
  Post,
  UseGuards,
  Req,
} from '@nestjs/common';

import {
  ApiBearerAuth,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

import { JwtGuard } from '../auth/jwt/jwt.guard.js';

import { InteligenciaService } from './inteligencia.service.js';
import { RecomendacaoDto } from './dto/recomendacao.dto.js';
import { MensagemChatDto } from './dto/mensagem-chat.dto.js';
import { ConfirmarAcaoDto } from './dto/confirmar-acao.dto.js';

interface RequestComUsuario {
  user: {
    id: number;
  };
}

@ApiTags('Inteligência')
@ApiBearerAuth()
@Controller('inteligencia')
@UseGuards(JwtGuard)
export class InteligenciaController {
  constructor(
    private readonly inteligenciaService: InteligenciaService,
  ) {}

  @Post('recomendacoes')
  @ApiOperation({
    summary: 'Gerar recomendações inteligentes para a academia',
  })
  gerarRecomendacoes(@Body() dto: RecomendacaoDto) {
    return this.inteligenciaService.gerarRecomendacoes(dto);
  }

  @Post('chat')
  @ApiOperation({
    summary: 'Interpretar mensagem e salvar no histórico do FitBot',
  })
  interpretarMensagem(
    @Body() dto: MensagemChatDto,
    @Req() req: RequestComUsuario,
  ) {
    return this.inteligenciaService.interpretarMensagem(
      dto,
      Number(req.user.id),
    );
  }

  @Post('chat/confirmar')
  @ApiOperation({
    summary: 'Confirmar ou cancelar uma ação pendente do FitBot',
  })
  confirmarAcao(
    @Body() dto: ConfirmarAcaoDto,
    @Req() req: RequestComUsuario,
  ) {
    return this.inteligenciaService.confirmarAcao(
      dto,
      Number(req.user.id),
    );
  }
}
