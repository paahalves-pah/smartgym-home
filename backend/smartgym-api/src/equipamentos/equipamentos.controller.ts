import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Body,
  Param,
  ParseIntPipe,
} from '@nestjs/common';

import { EquipamentosService } from './equipamentos.service.js';
import { CriarEquipamentoDto } from './dto/equipamento.dto.js';

@Controller('equipamentos')
export class EquipamentosController {
  constructor(
    private readonly equipamentosService: EquipamentosService,
  ) {}

  @Post()
  criar(@Body() dados: CriarEquipamentoDto) {
    return this.equipamentosService.criar(dados);
  }

  @Get()
  listar() {
    return this.equipamentosService.listar();
  }

  @Get(':id')
  buscarPorId(@Param('id', ParseIntPipe) id: number) {
    return this.equipamentosService.buscarPorId(id);
  }

  @Put(':id')
  atualizar(
    @Param('id', ParseIntPipe) id: number,
    @Body() dados: Partial<CriarEquipamentoDto>,
  ) {
    return this.equipamentosService.atualizar(id, dados);
  }

  @Delete(':id')
  excluir(@Param('id', ParseIntPipe) id: number) {
    return this.equipamentosService.excluir(id);
  }
}

