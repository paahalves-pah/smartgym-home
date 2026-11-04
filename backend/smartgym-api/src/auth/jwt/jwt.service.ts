import {
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtService extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    const secret = configService.get<string>('JWT_SECRET');

    if (!secret) {
      throw new Error(
        'JWT_SECRET não está configurada no arquivo .env',
      );
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  async validate(payload: {
    sub: number;
    email: string;
    tipoUsuario: string;
  }) {
    if (!payload.sub || !payload.email) {
      throw new UnauthorizedException(
        'Token inválido.',
      );
    }

    return {
      id: payload.sub,
      email: payload.email,
      tipoUsuario: payload.tipoUsuario,
    };
  }
}
