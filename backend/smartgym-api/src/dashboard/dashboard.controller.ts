
import {
  Controller,
  Get,
  Post,
  UseGuards,
  Req,
  ParseIntPipe,
  Param,
  ForbiddenException,
} from '@nestjs/common';

import {
  ApiTags,
  ApiBearerAuth,
} from '@nestjs/swagger';

import { DashboardService } from './dashboard.service.js';
import { JwtGuard } from '../auth/jwt/jwt.guard.js';

interface UsuarioAutenticado {
  id: number;
  email: string;
  tipoUsuario: string;
}

interface RequestAutenticado {
  user: UsuarioAutenticado;
}

@ApiTags('Dashboard')
@ApiBearerAuth()
@UseGuards(JwtGuard)
@Controller('dashboard')
export class DashboardController {
  constructor(
    private readonly dashboardService: DashboardService,
  ) {}

  @Get('resumo')
  obterResumo() {
    return this.dashboardService.obterResumo();
  }

  @Get('uso-semanal')
  obterUsoSemanal() {
    return this.dashboardService.obterUsoSemanal();
  }

  @Get('desempenho/usuarios')
  obterDesempenhoTodosUsuarios(
    @Req() req: RequestAutenticado,
  ) {
    return this.dashboardService.verificarPermissaoTodosDesempenhos(
      req.user,
    );
  }

  @Get('desempenho/:id')
  obterDesempenhoUsuario(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: RequestAutenticado,
  ) {
    return this.dashboardService.verificarPermissaoDesempenho(
      req.user,
      id,
    );
  }

  @Get('desempenho')
  obterMeuDesempenho(
    @Req() req: RequestAutenticado,
  ) {
    return this.dashboardService.obterDesempenhoUsuario(
      req.user.id,
    );
  }

  @Post('inteligencia/treinar')
  treinarModelo(
    @Req() req: RequestAutenticado,
  ) {
    if (req.user.tipoUsuario !== 'ADMIN') {
      throw new ForbiddenException(
        'Apenas administradores podem treinar o modelo.',
      );
    }

    return this.dashboardService.treinarModeloMachineLearning();
  }
}
