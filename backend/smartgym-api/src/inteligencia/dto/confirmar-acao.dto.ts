
import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsInt,
  Min,
} from 'class-validator';

export class ConfirmarAcaoDto {
  @ApiProperty({
    example: 1,
    description: 'ID da conversa que possui a ação pendente.',
  })
  @IsInt()
  @Min(1)
  conversaId: number;

  @ApiProperty({
    example: true,
    description: 'Informe true para confirmar ou false para cancelar.',
  })
  @IsBoolean()
  confirmar: boolean;
}
