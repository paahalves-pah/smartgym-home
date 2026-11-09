import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
  Req,
  ForbiddenException,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';

import {
  ApiTags,
  ApiBearerAuth,
} from '@nestjs/swagger';

import { FileInterceptor } from '@nestjs/platform-express';

import { diskStorage } from 'multer';

import { extname } from 'path';

import { randomUUID } from 'crypto';

import type { Request } from 'express';

import { JwtGuard } from '../auth/jwt/jwt.guard.js';

import { EquipamentosService } from './equipamentos.service.js';

import {
  CriarEquipamentoDto,
  AtualizarEquipamentoDto,
} from './dto/equipamento.dto.js';

interface RequestComUsuario extends Request {
  user: {
    id: number;
    email: string;
    tipoUsuario: string;
  };
}

const uploadImagem = FileInterceptor('imagem', {
  storage: diskStorage({
    destination: './uploads/equipamentos',

    filename: (_req, file, callback) => {
      const nomeArquivo = `${randomUUID()}${extname(file.originalname)}`;

      callback(null, nomeArquivo);
    },
  }),

  limits: {
    fileSize: 5 * 1024 * 1024,
  },

  fileFilter: (_req, file, callback) => {
    const extensoesPermitidas = [
      '.jpg',
      '.jpeg',
      '.png',
      '.webp',
    ];

    const extensao = extname(file.originalname).toLowerCase();

    if (!extensoesPermitidas.includes(extensao)) {
      return callback(
        new BadRequestException(
          'Formato inválido. Envie JPG, PNG ou WebP.',
        ),
        false,
      );
    }

    callback(null, true);
  },
});

@ApiTags('Equipamentos')
@ApiBearerAuth()
@UseGuards(JwtGuard)
@Controller('equipamentos')
export class EquipamentosController {
  constructor(
    private readonly equipamentosService: EquipamentosService,
  ) {}

  @Post()
  @UseInterceptors(uploadImagem)
  criar(
    @Body() dados: CriarEquipamentoDto,
    @UploadedFile() arquivo: Express.Multer.File,
    @Req() req: RequestComUsuario,
  ) {
    if (req.user.tipoUsuario !== 'ADMIN') {
      throw new ForbiddenException(
        'Apenas administradores podem cadastrar equipamentos.',
      );
    }

    const imagem = arquivo
      ? `/uploads/equipamentos/${arquivo.filename}`
      : null;

    return this.equipamentosService.criar(dados, imagem);
  }

  @Get()
  listar() {
    return this.equipamentosService.listar();
  }

  @Get(':id')
  buscarPorId(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.equipamentosService.buscarPorId(id);
  }

  @Put(':id')
  @UseInterceptors(uploadImagem)
  atualizar(
    @Param('id', ParseIntPipe) id: number,
    @Body() dados: AtualizarEquipamentoDto,
    @UploadedFile() arquivo: Express.Multer.File,
    @Req() req: RequestComUsuario,
  ) {
    if (req.user.tipoUsuario !== 'ADMIN') {
      throw new ForbiddenException(
        'Apenas administradores podem atualizar equipamentos.',
      );
    }

    const imagem = arquivo
      ? `/uploads/equipamentos/${arquivo.filename}`
      : undefined;

    return this.equipamentosService.atualizar(
      id,
      dados,
      imagem,
    );
  }

  @Delete(':id')
  excluir(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: RequestComUsuario,
  ) {
    if (req.user.tipoUsuario !== 'ADMIN') {
      throw new ForbiddenException(
        'Apenas administradores podem excluir equipamentos.',
      );
    }

    return this.equipamentosService.excluir(id);
  }
}