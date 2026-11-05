import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import {
  Manutencao,
  StatusManutencao,
} from '../entities/manutencao.entity.js';

import {
  Equipamento,
  StatusEquipamento,
} from '../entities/equipamento.entity.js';

import {
  Utilizacao,
  StatusUtilizacao,
} from '../entities/utilizacao.entity.js';

import { CriarManutencaoDto } from './dto/criar-manutencao.dto.js';

@Injectable()
export class ManutencoesService {
  constructor(
    @InjectRepository(Manutencao)
    private readonly manutencaoRepository: Repository<Manutencao>,

    @InjectRepository(Equipamento)
    private readonly equipamentoRepository: Repository<Equipamento>,

    @InjectRepository(Utilizacao)
    private readonly utilizacaoRepository: Repository<Utilizacao>,
  ) {}

  async agendar(
    dados: CriarManutencaoDto,
  ): Promise<Manutencao> {
    const equipamento = await this.equipamentoRepository.findOne({
      where: { id: dados.equipamentoId },
    });

    if (!equipamento) {
      throw new NotFoundException(
        'Equipamento não encontrado.',
      );
    }

    if (equipamento.status === StatusEquipamento.INATIVO) {
      throw new BadRequestException(
        'Não é possível agendar manutenção para um equipamento inativo.',
      );
    }

    if (equipamento.status === StatusEquipamento.EM_MANUTENCAO) {
      throw new BadRequestException(
        'Este equipamento já está em manutenção.',
      );
    }

    const dataPrevista = new Date(dados.dataPrevista);

    if (dataPrevista.getTime() <= Date.now()) {
      throw new BadRequestException(
        'A data prevista da manutenção deve ser futura.',
      );
    }

    const manutencao = this.manutencaoRepository.create({
      equipamento,
      tipo: dados.tipo,
      descricao: dados.descricao.trim(),
      dataPrevista,
      responsavel: dados.responsavel?.trim() || null,
      observacoes: dados.observacoes?.trim() || null,
      status: StatusManutencao.AGENDADA,
    });

    return this.manutencaoRepository.save(manutencao);
  }

  async iniciar(id: number): Promise<Manutencao> {
    const manutencao = await this.manutencaoRepository.findOne({
      where: { id },
      relations: {
        equipamento: true,
      },
    });

    if (!manutencao) {
      throw new NotFoundException(
        'Manutenção não encontrada.',
      );
    }

    if (manutencao.status !== StatusManutencao.AGENDADA) {
      throw new BadRequestException(
        'Somente manutenções agendadas podem ser iniciadas.',
      );
    }

    const equipamento = manutencao.equipamento;

    if (equipamento.status === StatusEquipamento.INATIVO) {
      throw new BadRequestException(
        'Não é possível iniciar manutenção em equipamento inativo.',
      );
    }

    if (equipamento.status === StatusEquipamento.EM_MANUTENCAO) {
      throw new BadRequestException(
        'Este equipamento já está em manutenção.',
      );
    }

    const utilizacaoEmAndamento =
      await this.utilizacaoRepository.findOne({
        where: {
          equipamento: {
            id: equipamento.id,
          },
          status: StatusUtilizacao.EM_ANDAMENTO,
        },
      });

    if (utilizacaoEmAndamento) {
      throw new BadRequestException(
        'Não é possível iniciar manutenção enquanto o equipamento estiver sendo utilizado.',
      );
    }

    manutencao.status = StatusManutencao.EM_ANDAMENTO;
    manutencao.dataInicio = new Date();

    equipamento.status = StatusEquipamento.EM_MANUTENCAO;

    await this.equipamentoRepository.save(equipamento);

    return this.manutencaoRepository.save(manutencao);
  }

  async concluir(id: number): Promise<Manutencao> {
    const manutencao = await this.manutencaoRepository.findOne({
      where: { id },
      relations: {
        equipamento: true,
      },
    });

    if (!manutencao) {
      throw new NotFoundException(
        'Manutenção não encontrada.',
      );
    }

    if (manutencao.status !== StatusManutencao.EM_ANDAMENTO) {
      throw new BadRequestException(
        'Somente manutenções em andamento podem ser concluídas.',
      );
    }

    const equipamento = manutencao.equipamento;

    const outraManutencaoEmAndamento =
      await this.manutencaoRepository.findOne({
        where: {
          equipamento: {
            id: equipamento.id,
          },
          status: StatusManutencao.EM_ANDAMENTO,
        },
      });

    if (
      outraManutencaoEmAndamento &&
      outraManutencaoEmAndamento.id !== manutencao.id
    ) {
      throw new BadRequestException(
        'O equipamento possui outra manutenção em andamento.',
      );
    }

    manutencao.status = StatusManutencao.CONCLUIDA;
    manutencao.dataConclusao = new Date();

    // Não reativa equipamentos que estejam inativos.
    if (equipamento.status !== StatusEquipamento.INATIVO) {
      equipamento.status = StatusEquipamento.DISPONIVEL;

      await this.equipamentoRepository.save(equipamento);
    }

    return this.manutencaoRepository.save(manutencao);
  }

  async listarTodas(): Promise<Manutencao[]> {
    return this.manutencaoRepository.find({
      relations: {
        equipamento: true,
      },
      order: {
        criadoEm: 'DESC',
      },
    });
  }

  async cancelar(id: number): Promise<Manutencao> {
    const manutencao = await this.manutencaoRepository.findOne({
      where: { id },
      relations: {
        equipamento: true,
      },
    });

    if (!manutencao) {
      throw new NotFoundException(
        'Manutenção não encontrada.',
      );
    }

    if (manutencao.status !== StatusManutencao.AGENDADA) {
      throw new BadRequestException(
        'Somente manutenções agendadas podem ser canceladas.',
      );
    }

    manutencao.status = StatusManutencao.CANCELADA;

    return this.manutencaoRepository.save(manutencao);
  }
}