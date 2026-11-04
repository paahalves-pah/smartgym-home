import {
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import { UsuariosService } from '../usuarios/usuarios.service.js';

@Injectable()
export class AuthService {
  constructor(
    private readonly usuariosService: UsuariosService,
    private readonly jwtService: JwtService,
  ) {}

  async login(dados: {
    email: string;
    senha: string;
  }) {
    const usuario =
      await this.usuariosService.buscarPorEmail(
        dados.email,
      );

    if (!usuario || !usuario.ativo) {
      throw new UnauthorizedException(
        'E-mail ou senha inválidos.',
      );
    }

    const senhaValida = await bcrypt.compare(
      dados.senha,
      usuario.senhaHash,
    );

    if (!senhaValida) {
      throw new UnauthorizedException(
        'E-mail ou senha inválidos.',
      );
    }

    const payload = {
      sub: usuario.id,
      email: usuario.email,
      tipoUsuario: usuario.tipoUsuario,
    };

    const accessToken =
      await this.jwtService.signAsync(payload);

    return {
      access_token: accessToken,

      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        tipoUsuario: usuario.tipoUsuario,
      },
    };
  }
}
