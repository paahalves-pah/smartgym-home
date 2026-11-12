
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, LessThanOrEqual } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';

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

const TEMPO_MAXIMO_UTILIZACAO_MS = 60 * 60 * 1000;

@Injectable()
export class UtilizacoesService {
  constructor(
    @InjectRepository(Utilizacao)
    private readonly utilizacoesRepository: Repository<Utilizacao>,

    @InjectRepository(Equipamento)
    private readonly equipamentosRepository: Repository<Equipamento>,

    @InjectRepository(Usuario)
    private readonly usuariosRepository: Repository<Usuario>,

    private readonly dataSource: DataSource,
  ) {}

  private normalizarCategoria(categoria: string): string {
    return categoria
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim()
      .toLowerCase();
  }

  private ehMusculacao(categoria: string): boolean {
    return this.normalizarCategoria(categoria) === 'musculacao';
  }

  async iniciar(usuarioId: number, dados: IniciarUtilizacaoDto) {
    return this.dataSource.transaction(async (manager) => {
      const usuariosRepository = manager.getRepository(Usuario);
      const equipamentosRepository = manager.getRepository(Equipamento);
      const utilizacoesRepository = manager.getRepository(Utilizacao);

      const usuario = await usuariosRepository.findOne({
        where: {
          id: usuarioId,
          ativo: true,
        },
        lock: {
          mode: 'pessimistic_write',
        },
      });

      if (!usuario) {
        throw new NotFoundException(
          'Usuário não encontrado ou inativo.',
        );
      }

      const equipamento = await equipamentosRepository.findOne({
        where: {
          id: dados.equipamentoId,
          ativo: true,
        },
        lock: {
          mode: 'pessimistic_write',
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

      const utilizacoesUsuarioEmAndamento =
        await utilizacoesRepository.find({
          where: {
            usuario: { id: usuarioId },
            status: StatusUtilizacao.EM_ANDAMENTO,
          },
          relations: {
            equipamento: true,
          },
        });

      if (utilizacoesUsuarioEmAndamento.length > 0) {
        const todasSaoMusculacao =
          utilizacoesUsuarioEmAndamento.every((utilizacao) =>
            this.ehMusculacao(utilizacao.equipamento.categoria),
          );

        const novoEquipamentoEhMusculacao = this.ehMusculacao(
          equipamento.categoria,
        );

        if (!todasSaoMusculacao || !novoEquipamentoEhMusculacao) {
          throw new BadRequestException(
            'Você só pode utilizar mais de um equipamento simultaneamente quando todos forem da categoria Musculação.',
          );
        }
      }

      const utilizacaoEquipamentoEmAndamento =
        await utilizacoesRepository.findOne({
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

      const utilizacao = utilizacoesRepository.create({
        usuario,
        equipamento,
        status: StatusUtilizacao.EM_ANDAMENTO,
      });

      const utilizacaoSalva =
        await utilizacoesRepository.save(utilizacao);

      equipamento.status = StatusEquipamento.EM_USO;

      await equipamentosRepository.save(equipamento);

      return utilizacoesRepository.findOne({
        where: {
          id: utilizacaoSalva.id,
        },
        relations: {
          usuario: true,
          equipamento: true,
        },
      });
    });
  }

  async finalizar(
    utilizacaoId: number,
    usuarioId: number,
    ehAdmin = false,
  ) {
    return this.dataSource.transaction(async (manager) => {
      const utilizacoesRepository = manager.getRepository(Utilizacao);
      const equipamentosRepository = manager.getRepository(Equipamento);

      const utilizacao = await utilizacoesRepository.findOne({
        where: {
          id: utilizacaoId,
        },
        relations: {
          usuario: true,
          equipamento: true,
        },
        lock: {
          mode: 'pessimistic_write',
        },
      });

      if (!utilizacao) {
        throw new NotFoundException(
          'Utilização não encontrada.',
        );
      }

      if (!ehAdmin && utilizacao.usuario.id !== usuarioId) {
        throw new ForbiddenException(
          'Você não tem permissão para finalizar esta utilização.',
        );
      }

      if (utilizacao.status === StatusUtilizacao.FINALIZADA) {
        throw new BadRequestException(
          'Esta utilização já foi finalizada.',
        );
      }

      const horarioLimite = new Date(
        utilizacao.inicioEm.getTime() +
          TEMPO_MAXIMO_UTILIZACAO_MS,
      );

      const agora = new Date();

      utilizacao.fimEm =
        agora > horarioLimite ? horarioLimite : agora;

      utilizacao.status = StatusUtilizacao.FINALIZADA;

      const utilizacaoSalva =
        await utilizacoesRepository.save(utilizacao);

      const equipamento = await equipamentosRepository.findOne({
        where: {
          id: utilizacao.equipamento.id,
        },
      });

      if (equipamento) {
        equipamento.status = StatusEquipamento.DISPONIVEL;

        await equipamentosRepository.save(equipamento);
      }

      return utilizacaoSalva;
    });
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async encerrarUtilizacoesExpiradas() {
    const horarioLimite = new Date(
      Date.now() - TEMPO_MAXIMO_UTILIZACAO_MS,
    );

    const utilizacoesExpiradas =
      await this.utilizacoesRepository.find({
        where: {
          status: StatusUtilizacao.EM_ANDAMENTO,
          inicioEm: LessThanOrEqual(horarioLimite),
        },
        select: {
          id: true,
        },
      });

    for (const utilizacao of utilizacoesExpiradas) {
      await this.encerrarAutomaticamente(utilizacao.id);
    }
  }

  private async encerrarAutomaticamente(utilizacaoId: number) {
    return this.dataSource.transaction(async (manager) => {
      const utilizacoesRepository = manager.getRepository(Utilizacao);
      const equipamentosRepository = manager.getRepository(Equipamento);

      const utilizacao = await utilizacoesRepository.findOne({
        where: {
          id: utilizacaoId,
        },
        relations: {
          equipamento: true,
        },
        lock: {
          mode: 'pessimistic_write',
        },
      });

      if (
        !utilizacao ||
        utilizacao.status !== StatusUtilizacao.EM_ANDAMENTO
      ) {
        return;
      }

      utilizacao.fimEm = new Date(
        utilizacao.inicioEm.getTime() +
          TEMPO_MAXIMO_UTILIZACAO_MS,
      );

      utilizacao.status = StatusUtilizacao.FINALIZADA;

      await utilizacoesRepository.save(utilizacao);

      const equipamento = await equipamentosRepository.findOne({
        where: {
          id: utilizacao.equipamento.id,
        },
      });

      if (equipamento) {
        equipamento.status = StatusEquipamento.DISPONIVEL;

        await equipamentosRepository.save(equipamento);
      }
    });
  }

  private formatarHistorico(utilizacoes: Utilizacao[]) {
    return utilizacoes.map((utilizacao) => ({
      id: utilizacao.id,
      usuario: {
        id: utilizacao.usuario.id,
        nome: utilizacao.usuario.nome,
      },
      equipamento: {
        id: utilizacao.equipamento.id,
        nome: utilizacao.equipamento.nome,
        categoria: utilizacao.equipamento.categoria,
      },
      inicioEm: utilizacao.inicioEm,
      fimEm: utilizacao.fimEm,
      status: utilizacao.status,
      duracaoSegundos: utilizacao.fimEm
        ? Math.floor(
            (utilizacao.fimEm.getTime() -
              utilizacao.inicioEm.getTime()) /
              1000,
          )
        : null,
    }));
  }

  async meuHistorico(usuarioId: number) {
    const utilizacoes = await this.utilizacoesRepository.find({
      where: {
        usuario: {
          id: usuarioId,
        },
      },
      relations: {
        usuario: true,
        equipamento: true,
      },
      order: {
        inicioEm: 'DESC',
      },
    });

    return this.formatarHistorico(utilizacoes);
  }

  async historicoGeral() {
    const utilizacoes = await this.utilizacoesRepository.find({
      relations: {
        usuario: true,
        equipamento: true,
      },
      order: {
        inicioEm: 'DESC',
      },
    });

    return this.formatarHistorico(utilizacoes);
  }
}
