
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

import { PartialType } from '@nestjs/swagger';

import { StatusEquipamento } from '../../entities/equipamento.entity.js';

export class CriarEquipamentoDto {
  @IsString()
  @IsNotEmpty({ message: 'O nome do equipamento é obrigatório.' })
  @MaxLength(150)
  nome: string;

  @IsString()
  @IsNotEmpty({ message: 'A categoria é obrigatória.' })
  @MaxLength(100)
  categoria: string;

  @IsOptional()
  @IsString()
  descricao?: string;

  @IsOptional()
  @IsEnum(StatusEquipamento, {
    message: 'Informe um status válido.',
  })
  status?: StatusEquipamento;
}

export class AtualizarEquipamentoDto extends PartialType(
  CriarEquipamentoDto,
) {}
