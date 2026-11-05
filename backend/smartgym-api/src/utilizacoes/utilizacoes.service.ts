import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import {
  Utilizacao,
  StatusUtilizacao,
} from '../entities/utilizacao.entity.js';

import {
  Equipamento,
  StatusEquipamento,
} from '../entities/equipamento.entity.js';

import { Usuario } from '../entities/usuario.entity.js';
import { IniciarUtilizacaoDto } from './dto/iniciar-utilizacao.dto.js';

@Injectable()
export class UtilizacoesService {
  constructor(
    @InjectRepository(Utilizacao)
    private readonly utilizacoesRepository: Repository<Utilizacao>,

    @InjectRepository(Equipamento)
    private readonly equipamentosRepository: Repository<Equipamento>,

    @InjectRepository(Usuario)
    private readonly usuariosRepository: Repository<Usuario>,
  ) {}

  async iniciar(
    usuarioId: number,
    dados: IniciarUtilizacaoDto,
  ) {
    const usuario = await this.usuariosRepository.findOne({
      where: { id: usuarioId, ativo: true },
      select: {
        id: true,
        nome: true,
        email: true,
        tipoUsuario: true,
        ativo: true,
        criadoEm: true,
      },
    });

    if (!usuario) {
      throw new NotFoundException(
        'Usuário não encontrado ou inativo.',
      );
    }

    const equipamento = await this.equipamentosRepository.findOne({
      where: {
        id: dados.equipamentoId,
        ativo: true,
      },
    });

    if (!equipamento) {
      throw new NotFoundException(
        'Equipamento não encontrado ou inativo.',
      );
    }

    if (equipamento.status !== StatusEquipamento.DISPONIVEL) {
      throw new BadRequestException(
        'Este equipamento não está disponível para utilização.',
      );
    }

    const utilizacaoEquipamentoEmAndamento =
      await this.utilizacoesRepository.findOne({
        where: {
          equipamento: { id: dados.equipamentoId },
          status: StatusUtilizacao.EM_ANDAMENTO,
        },
      });

    if (utilizacaoEquipamentoEmAndamento) {
      throw new BadRequestException(
        'Este equipamento já está sendo utilizado.',
      );
    }

    const utilizacaoEmAndamento =
      await this.utilizacoesRepository.findOne({
        where: {
          usuario: { id: usuarioId },
          equipamento: { id: dados.equipamentoId },
          status: StatusUtilizacao.EM_ANDAMENTO,
        },
      });

    if (utilizacaoEmAndamento) {
      throw new BadRequestException(
        'Você já possui uma utilização em andamento deste equipamento.',
      );
    }

    const utilizacao = this.utilizacoesRepository.create({
      usuario,
      equipamento,
      status: StatusUtilizacao.EM_ANDAMENTO,
    });

    return this.utilizacoesRepository.save(utilizacao);
  }

  async finalizar(
    utilizacaoId: number,
    usuarioId: number,
  ) {
    const utilizacao = await this.utilizacoesRepository.findOne({
      where: { id: utilizacaoId },
      relations: {
        usuario: true,
        equipamento: true,
      },
      select: {
        id: true,
        inicioEm: true,
        fimEm: true,
        status: true,
        usuario: {
          id: true,
          nome: true,
          email: true,
          tipoUsuario: true,
          ativo: true,
          criadoEm: true,
        },
        equipamento: {
          id: true,
          nome: true,
          categoria: true,
          descricao: true,
          status: true,
          ativo: true,
          criadoEm: true,
        },
      },
    });

    if (!utilizacao) {
      throw new NotFoundException(
        'Utilização não encontrada.',
      );
    }

    if (!utilizacao.usuario) {
      throw new NotFoundException(
        'Usuário associado à utilização não encontrado.',
      );
    }

    if (utilizacao.usuario.id !== usuarioId) {
      throw new ForbiddenException(
        'Você não tem permissão para finalizar esta utilização.',
      );
    }

    if (utilizacao.status === StatusUtilizacao.FINALIZADA) {
      throw new BadRequestException(
        'Esta utilização já foi finalizada.',
      );
    }

    utilizacao.fimEm = new Date();
    utilizacao.status = StatusUtilizacao.FINALIZADA;

    return this.utilizacoesRepository.save(utilizacao);
  }

  async meuHistorico(usuarioId: number) {
    return this.utilizacoesRepository.find({
      where: {
        usuario: { id: usuarioId },
      },
      relations: {
        equipamento: true,
      },
      select: {
        id: true,
        inicioEm: true,
        fimEm: true,
        status: true,
        equipamento: {
          id: true,
          nome: true,
          categoria: true,
          descricao: true,
          status: true,
          ativo: true,
          criadoEm: true,
        },
      },
      order: {
        inicioEm: 'DESC',
      },
    });
  }
}