import {
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

import { TipoManutencao } from '../../entities/manutencao.entity.js';

export class CriarManutencaoDto {
  @IsInt()
  @Min(1)
  equipamentoId: number;

  @IsEnum(TipoManutencao)
  tipo: TipoManutencao;

  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(255)
  descricao: string;

  @IsDateString()
  dataPrevista: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  responsavelId?: number;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  observacoes?: string;
}