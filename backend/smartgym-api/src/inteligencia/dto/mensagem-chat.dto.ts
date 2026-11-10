
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  MaxLength,
  IsOptional,
  IsInt,
  Min,
} from 'class-validator';

export class MensagemChatDto {
  @ApiProperty({
    example: 'Quero usar a esteira',
    description: 'Mensagem enviada pelo usuário ao FitBot.',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  texto: string;

  @ApiPropertyOptional({
    example: 1,
    description: 'ID da conversa existente. Se omitido, uma nova conversa será criada.',
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  conversaId?: number;
}
