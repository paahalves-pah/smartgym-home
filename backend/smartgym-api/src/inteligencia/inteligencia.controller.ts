import {
  Body,
  Controller,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { JwtGuard } from '../auth/jwt/jwt.guard.js';
import { InteligenciaService } from './inteligencia.service.js';
import { RecomendacaoDto } from './dto/recomendacao.dto.js';

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
}
