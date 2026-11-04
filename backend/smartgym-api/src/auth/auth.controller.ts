import {
  Body,
  Controller,
  Post,
  Get,
  UseGuards,
  Request,
  HttpCode,
} from '@nestjs/common';

import { AuthService } from './auth.service.js';
import { JwtGuard } from './jwt/jwt.guard.js';

import {
  IsEmail,
  IsNotEmpty,
  IsString,
} from 'class-validator';

class LoginDto {
  @IsEmail({}, { message: 'Informe um e-mail válido.' })
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty({ message: 'A senha é obrigatória.' })
  senha: string;
}

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
  ) {}

  @Post('login')
  @HttpCode(200)
  login(@Body() dados: LoginDto) {
    return this.authService.login(dados);
  }

  @Get('perfil')
  @UseGuards(JwtGuard)
  perfil(@Request() req: { user: any }) {
    return req.user;
  }
}

