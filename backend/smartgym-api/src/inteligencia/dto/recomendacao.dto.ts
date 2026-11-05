import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, MaxLength } from 'class-validator';

export class RecomendacaoDto {
  @ApiProperty({
    description: 'Contexto atual da academia ou dos equipamentos',
    example: 'A academia possui 3 esteiras, 2 bicicletas e uma esteira está apresentando falhas frequentes.',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  contexto: string;

  @ApiPropertyOptional({
    description: 'Objetivo da recomendação',
    example: 'Reduzir falhas e melhorar a manutenção dos equipamentos',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  objetivo?: string;
}