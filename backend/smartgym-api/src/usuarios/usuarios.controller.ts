
import {
  Body,
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Param,
  ParseIntPipe,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Req,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';

import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiTags,
} from '@nestjs/swagger';

import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';

import { randomUUID } from 'crypto';
import { extname, join } from 'path';
import { mkdirSync } from 'fs';

import { UsuariosService } from './usuarios.service.js';
import { CriarUsuarioDto } from './dto/criar-usuario.dto.js';
import { AtualizarUsuarioDto } from './dto/atualizar-usuario.dto.js';
import { JwtGuard } from '../auth/jwt/jwt.guard.js';

const pastaFotos = join(
  process.cwd(),
  'uploads',
  'usuarios',
);

mkdirSync(pastaFotos, { recursive: true });

interface RequestComUsuario {
  params: {
    id: string;
  };
  user: {
    id: number;
    email: string;
    tipoUsuario: string;
  };
}

@ApiTags('Usuários')
@Controller('usuarios')
export class UsuariosController {
  constructor(
    private readonly usuariosService: UsuariosService,
  ) {}

  @Post()
  @UseGuards(JwtGuard)
  @ApiBearerAuth()
  criar(
    @Body() dados: CriarUsuarioDto,
    @Req() requisicao: RequestComUsuario,
  ) {
    if (requisicao.user.tipoUsuario !== 'ADMIN') {
      throw new ForbiddenException(
        'Apenas administradores podem cadastrar usuários.',
      );
    }

    return this.usuariosService.criar(dados);
  }

  @Get()
  @UseGuards(JwtGuard)
  @ApiBearerAuth()
  listar(@Req() requisicao: RequestComUsuario) {
    if (requisicao.user.tipoUsuario !== 'ADMIN') {
      throw new ForbiddenException(
        'Apenas administradores podem listar usuários.',
      );
    }

    return this.usuariosService.listar();
  }

  @Get(':id')
  @UseGuards(JwtGuard)
  @ApiBearerAuth()
  buscarPorId(
    @Param('id', ParseIntPipe) id: number,
    @Req() requisicao: RequestComUsuario,
  ) {
    if (
      requisicao.user.tipoUsuario !== 'ADMIN' &&
      requisicao.user.id !== id
    ) {
      throw new ForbiddenException(
        'Você não tem permissão para acessar este usuário.',
      );
    }

    return this.usuariosService.buscarPorId(id);
  }

  @Put(':id')
  @UseGuards(JwtGuard)
  @ApiBearerAuth()
  atualizar(
    @Param('id', ParseIntPipe) id: number,
    @Body() dados: AtualizarUsuarioDto,
    @Req() requisicao: RequestComUsuario,
  ) {
    if (
      requisicao.user.tipoUsuario !== 'ADMIN' &&
      requisicao.user.id !== id
    ) {
      throw new ForbiddenException(
        'Você não tem permissão para alterar este usuário.',
      );
    }

    return this.usuariosService.atualizar(
      id,
      dados,
      requisicao.user,
    );
  }

  @Post(':id/foto')
  @UseGuards(JwtGuard)
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        foto: {
          type: 'string',
          format: 'binary',
        },
      },
      required: ['foto'],
    },
  })
  @UseInterceptors(
    FileInterceptor('foto', {
      storage: diskStorage({
        destination: (_req, _file, callback) => {
          callback(null, pastaFotos);
        },

        filename: (_req, file, callback) => {
          const extensao = extname(
            file.originalname,
          ).toLowerCase();

          callback(
            null,
            `${randomUUID()}${extensao}`,
          );
        },
      }),

      limits: {
        fileSize: 2 * 1024 * 1024,
      },

      fileFilter: (req, file, callback) => {
        const requisicao = req as RequestComUsuario;
        const idUsuario = Number(requisicao.params.id);

        if (
          requisicao.user.tipoUsuario !== 'ADMIN' &&
          requisicao.user.id !== idUsuario
        ) {
          return callback(
            new ForbiddenException(
              'Você não tem permissão para alterar esta foto.',
            ),
            false,
          );
        }

        const tiposPermitidos = [
          'image/jpeg',
          'image/png',
          'image/webp',
        ];

        const extensoesPermitidas = [
          '.jpg',
          '.jpeg',
          '.png',
          '.webp',
        ];

        const extensao = extname(
          file.originalname,
        ).toLowerCase();

        if (
          !tiposPermitidos.includes(file.mimetype) ||
          !extensoesPermitidas.includes(extensao)
        ) {
          return callback(
            new BadRequestException(
              'Envie uma imagem JPG, PNG ou WEBP.',
            ),
            false,
          );
        }

        callback(null, true);
      },
    }),
  )
  async atualizarFoto(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() foto: Express.Multer.File,
    @Req() requisicao: RequestComUsuario,
  ) {
    if (
      requisicao.user.tipoUsuario !== 'ADMIN' &&
      requisicao.user.id !== id
    ) {
      throw new ForbiddenException(
        'Você não tem permissão para alterar esta foto.',
      );
    }

    if (!foto) {
      throw new BadRequestException(
        'Nenhuma imagem foi enviada.',
      );
    }

    const fotoUrl = `/uploads/usuarios/${foto.filename}`;

    return this.usuariosService.atualizarFoto(
      id,
      fotoUrl,
    );
  }

  @Delete(':id')
  @UseGuards(JwtGuard)
  @ApiBearerAuth()
  remover(
    @Param('id', ParseIntPipe) id: number,
    @Req() requisicao: RequestComUsuario,
  ) {
    if (requisicao.user.tipoUsuario !== 'ADMIN') {
      throw new ForbiddenException(
        'Apenas administradores podem excluir usuários.',
      );
    }

    return this.usuariosService.excluir(id);
  }
}
