
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
  IsBoolean,
} from 'class-validator';

export class AtualizarUsuarioDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  nome?: string;

  @IsOptional()
  @IsEmail({}, { message: 'Informe um e-mail válido.' })
  email?: string;

  @IsOptional()
  @IsString()
  @MinLength(8, {
    message: 'A senha deve ter pelo menos 8 caracteres.',
  })
  senha?: string;

  @IsOptional()
  @IsBoolean()
  ativo?: boolean;
}
