import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import {
  Equipamento,
  StatusEquipamento,
} from '../entities/equipamento.entity.js';

import {
  Manutencao,
  StatusManutencao,
} from '../entities/manutencao.entity.js';

import {
  Utilizacao,
  StatusUtilizacao,
} from '../entities/utilizacao.entity.js';

import { Usuario } from '../entities/usuario.entity.js';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Equipamento)
    private readonly equipamentoRepository: Repository<Equipamento>,

    @InjectRepository(Manutencao)
    private readonly manutencaoRepository: Repository<Manutencao>,

    @InjectRepository(Utilizacao)
    private readonly utilizacaoRepository: Repository<Utilizacao>,

    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
  ) {}

  async obterResumo() {
    const [
      totalEquipamentos,
      equipamentosDisponiveis,
      equipamentosEmManutencao,
      equipamentosInativos,
      manutencoesAgendadas,
      manutencoesEmAndamento,
      utilizacoesAtivas,
    ] = await Promise.all([
      this.equipamentoRepository.count(),

      this.equipamentoRepository.count({
        where: {
          status: StatusEquipamento.DISPONIVEL,
          ativo: true,
        },
      }),

      this.equipamentoRepository.count({
        where: {
          status: StatusEquipamento.EM_MANUTENCAO,
          ativo: true,
        },
      }),

      this.equipamentoRepository.count({
        where: [
          {
            status: StatusEquipamento.INATIVO,
          },
          {
            ativo: false,
          },
        ],
      }),

      this.manutencaoRepository.count({
        where: {
          status: StatusManutencao.AGENDADA,
        },
      }),

      this.manutencaoRepository.count({
        where: {
          status: StatusManutencao.EM_ANDAMENTO,
        },
      }),

      this.utilizacaoRepository.count({
        where: {
          status: StatusUtilizacao.EM_ANDAMENTO,
        },
      }),
    ]);

    return {
      totalEquipamentos,
      equipamentosDisponiveis,
      equipamentosEmManutencao,
      equipamentosInativos,
      manutencoesAgendadas,
      manutencoesEmAndamento,
      utilizacoesAtivas,
    };
  }

  async obterDesempenhoUsuario(usuarioId: number) {
    const usuario = await this.usuarioRepository.findOne({
      where: {
        id: usuarioId,
      },
    });

    if (!usuario) {
      throw new NotFoundException('Usuário não encontrado.');
    }

    const utilizacoes = await this.utilizacaoRepository.find({
      where: {
        usuario: {
          id: usuarioId,
        },
      },
      relations: {
        equipamento: true,
      },
      order: {
        inicioEm: 'DESC',
      },
    });

    const finalizadas = utilizacoes.filter(
      (utilizacao) =>
        utilizacao.status === StatusUtilizacao.FINALIZADA &&
        utilizacao.fimEm !== null,
    );

    const tempoTotalMinutos = finalizadas.reduce(
      (total, utilizacao) => {
        const inicio = new Date(utilizacao.inicioEm).getTime();
        const fim = new Date(utilizacao.fimEm!).getTime();

        return total + Math.max(0, fim - inicio) / 60000;
      },
      0,
    );

    const utilizacoesAtivas = utilizacoes.filter(
      (utilizacao) =>
        utilizacao.status === StatusUtilizacao.EM_ANDAMENTO,
    ).length;

    return {
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
      },
      totalTreinos: finalizadas.length,
      tempoTotalMinutos: Math.round(tempoTotalMinutos),
      tempoTotalHoras: Number(
        (tempoTotalMinutos / 60).toFixed(2),
      ),
      utilizacoesAtivas,
      historico: utilizacoes.map((utilizacao) => ({
        id: utilizacao.id,
        equipamento: utilizacao.equipamento.nome,
        inicioEm: utilizacao.inicioEm,
        fimEm: utilizacao.fimEm,
        status: utilizacao.status,
      })),
    };
  }

  async obterDesempenhoTodosUsuarios() {
    const usuarios = await this.usuarioRepository.find({
      select: {
        id: true,
        nome: true,
        email: true,
      },
    });

    return Promise.all(
      usuarios.map((usuario) =>
        this.obterDesempenhoUsuario(usuario.id),
      ),
    );
  }

  async verificarPermissaoDesempenho(
    usuarioLogado: {
      id: number;
      tipoUsuario: string;
    },
    usuarioId: number,
  ) {
    if (
      usuarioLogado.tipoUsuario !== 'ADMIN' &&
      usuarioLogado.id !== usuarioId
    ) {
      throw new ForbiddenException(
        'Você não tem permissão para consultar o desempenho deste usuário.',
      );
    }

    return this.obterDesempenhoUsuario(usuarioId);
  }

  async verificarPermissaoTodosDesempenhos(
    usuarioLogado: {
      tipoUsuario: string;
    },
  ) {
    if (usuarioLogado.tipoUsuario !== 'ADMIN') {
      throw new ForbiddenException(
        'Apenas administradores podem consultar o desempenho de todos os usuários.',
      );
    }

    return this.obterDesempenhoTodosUsuarios();
  }
}