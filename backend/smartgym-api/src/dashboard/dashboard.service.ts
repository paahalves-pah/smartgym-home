
import {
  Injectable,
  ForbiddenException,
  NotFoundException,
  BadGatewayException,
  BadRequestException,
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

  async obterIndicadoresMachineLearning() {
    const utilizacoes = await this.utilizacaoRepository.find({
      where: {
        status: StatusUtilizacao.FINALIZADA,
      },
      relations: {
        usuario: true,
        equipamento: true,
      },
      order: {
        inicioEm: 'DESC',
      },
    });

    const agora = new Date();

    const limite30Dias = new Date(agora);
    limite30Dias.setDate(agora.getDate() - 30);

    const indicadoresPorUsuario = new Map<
      number,
      {
        usuario_id: number;
        total_sessoes: number;
        sessoes_30_dias: number;
        duracao_total: number;
        equipamentos: Set<number>;
        dias_ativos: Set<string>;
      }
    >();

    for (const utilizacao of utilizacoes) {
      if (!utilizacao.fimEm) {
        continue;
      }

      const usuarioId = utilizacao.usuario.id;

      if (!indicadoresPorUsuario.has(usuarioId)) {
        indicadoresPorUsuario.set(usuarioId, {
          usuario_id: usuarioId,
          total_sessoes: 0,
          sessoes_30_dias: 0,
          duracao_total: 0,
          equipamentos: new Set<number>(),
          dias_ativos: new Set<string>(),
        });
      }

      const indicador = indicadoresPorUsuario.get(usuarioId)!;

      const inicio = new Date(utilizacao.inicioEm);
      const fim = new Date(utilizacao.fimEm);

      const duracaoMinutos = Math.max(
        0,
        (fim.getTime() - inicio.getTime()) / 60000,
      );

      indicador.total_sessoes++;
      indicador.duracao_total += duracaoMinutos;

      indicador.equipamentos.add(utilizacao.equipamento.id);

      if (inicio >= limite30Dias && inicio <= agora) {
        indicador.sessoes_30_dias++;

        indicador.dias_ativos.add(
          inicio.toISOString().slice(0, 10),
        );
      }
    }

    return Array.from(indicadoresPorUsuario.values()).map(
      (indicador) => ({
        usuario_id: indicador.usuario_id,
        total_sessoes: indicador.total_sessoes,
        frequencia_semanal: Number(
          (indicador.sessoes_30_dias / (30 / 7)).toFixed(2),
        ),
        duracao_media_minutos: Number(
          (
            indicador.duracao_total /
            indicador.total_sessoes
          ).toFixed(2),
        ),
        diversidade_equipamentos: indicador.equipamentos.size,
        dias_ativos: indicador.dias_ativos.size,
      }),
    );
  }

  async treinarModeloMachineLearning() {
    const usuarios = await this.obterIndicadoresMachineLearning();

    if (usuarios.length < 3) {
      throw new BadRequestException(
        'São necessários pelo menos 3 usuários com histórico de utilização para treinar o modelo.',
      );
    }

    const endereco =
      process.env.ML_API_URL || 'http://127.0.0.1:8000';

    try {
      const resposta = await fetch(
        `${endereco}/recommend/train`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            usuarios,
          }),
        },
      );

      const resultado = await resposta.json();

      if (!resposta.ok) {
        throw new BadGatewayException({
          mensagem:
            'O serviço de Machine Learning recusou o treinamento.',
          detalhe: resultado,
        });
      }

      return {
        mensagem: 'Treinamento do modelo realizado com sucesso.',
        usuariosEnviados: usuarios.length,
        resultado,
      };
    } catch (erro) {
      if (erro instanceof BadGatewayException) {
        throw erro;
      }

      throw new BadGatewayException(
        'Não foi possível estabelecer comunicação com o serviço de Machine Learning.',
      );
    }
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

async obterUsoSemanal() {
  const agora = new Date();

  const inicioPeriodo = new Date(agora);
  inicioPeriodo.setHours(0, 0, 0, 0);
  inicioPeriodo.setDate(inicioPeriodo.getDate() - 6);

  const utilizacoes = await this.utilizacaoRepository.find({
    where: {
      status: StatusUtilizacao.FINALIZADA,
    },
    order: {
      inicioEm: 'ASC',
    },
  });

  const diasSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  const resultado = Array.from({ length: 7 }, (_, indice) => {
    const data = new Date(inicioPeriodo);
    data.setDate(inicioPeriodo.getDate() + indice);

    const chaveData = [
      data.getFullYear(),
      String(data.getMonth() + 1).padStart(2, '0'),
      String(data.getDate()).padStart(2, '0'),
    ].join('-');

    return {
      data: chaveData,
      dia: diasSemana[data.getDay()],
      total: 0,
    };
  });

  const mapaDias = new Map(
    resultado.map((item) => [item.data, item]),
  );

  for (const utilizacao of utilizacoes) {
    const dataInicio = new Date(utilizacao.inicioEm);

    if (dataInicio < inicioPeriodo || dataInicio > agora) {
      continue;
    }

    const chaveData = [
      dataInicio.getFullYear(),
      String(dataInicio.getMonth() + 1).padStart(2, '0'),
      String(dataInicio.getDate()).padStart(2, '0'),
    ].join('-');

    const dia = mapaDias.get(chaveData);

    if (dia) {
      dia.total++;
    }
  }

  return resultado;
}

}
