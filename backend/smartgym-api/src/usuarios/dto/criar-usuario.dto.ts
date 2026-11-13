
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  MaxLength,
  IsEnum,
} from 'class-validator';

import { TipoUsuario } from '../../entities/usuario.entity.js';

export class CriarUsuarioDto {
  @IsString()
  @IsNotEmpty({ message: 'O nome é obrigatório.' })
  @MaxLength(150)
  nome: string;

  @IsEmail({}, { message: 'Informe um e-mail válido.' })
  @IsNotEmpty({ message: 'O e-mail é obrigatório.' })
  @MaxLength(150)
  email: string;

  @IsString()
  @IsNotEmpty({ message: 'A senha é obrigatória.' })
  @MinLength(8, {
    message: 'A senha deve ter pelo menos 8 caracteres.',
  })
  senha: string;

  @IsEnum(TipoUsuario, {
    message: 'O tipo de usuário deve ser USER ou ADMIN.',
  })
  tipoUsuario: TipoUsuario;
}
