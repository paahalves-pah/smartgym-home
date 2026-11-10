
import {
  Injectable,
  ServiceUnavailableException,
  BadGatewayException,
  BadRequestException,
} from '@nestjs/common';

import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import Groq from 'groq-sdk';

import { RecomendacaoDto } from './dto/recomendacao.dto.js';
import { MensagemChatDto } from './dto/mensagem-chat.dto.js';
import { ConfirmarAcaoDto } from './dto/confirmar-acao.dto.js';

import { ConversasService } from '../conversas/conversas.service.js';
import { RemetenteChat } from '../entities/mensagem-chat.entity.js';
import {
  Equipamento,
  StatusEquipamento,
} from '../entities/equipamento.entity.js';
import { UtilizacoesService } from '../utilizacoes/utilizacoes.service.js';

@Injectable()
export class InteligenciaService {
  private readonly groq: Groq | null;
  private readonly mlApiUrl: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly conversasService: ConversasService,
    private readonly utilizacoesService: UtilizacoesService,

    @InjectRepository(Equipamento)
    private readonly equipamentosRepository: Repository<Equipamento>,
  ) {
    const apiKey = this.configService.get<string>('GROQ_API_KEY');

    this.groq = apiKey
      ? new Groq({ apiKey })
      : null;

    this.mlApiUrl = (
      this.configService.get<string>('ML_API_URL') ??
      'http://127.0.0.1:8000'
    ).replace(/\/+$/, '');
  }

  async gerarRecomendacoes(dto: RecomendacaoDto) {
    if (!this.groq) {
      throw new ServiceUnavailableException(
        'A chave da Groq não está configurada.',
      );
    }

    try {
      const resposta =
        await this.groq.chat.completions.create({
          model: 'openai/gpt-oss-20b',
          messages: [
            {
              role: 'system',
              content:
                'Você é um assistente especializado em SmartGym e gestão inteligente de academias. Gere recomendações práticas, claras e seguras com base no contexto fornecido. Não invente dados que não foram informados.',
            },
            {
              role: 'user',
              content: `Contexto: ${dto.contexto}
Objetivo: ${
                dto.objetivo ?? 'Gerar recomendações gerais'
              }`,
            },
          ],
          temperature: 0.7,
        });

      return {
        sucesso: true,
        recomendacoes:
          resposta.choices[0]?.message?.content ??
          'Não foi possível gerar recomendações.',
        modelo: 'openai/gpt-oss-20b',
        provedor: 'Groq',
      };
    } catch {
      throw new BadGatewayException(
        'Não foi possível obter recomendações da IA. Tente novamente mais tarde.',
      );
    }
  }

  async interpretarMensagem(
    dto: MensagemChatDto,
    usuarioId: number,
  ) {
    let conversaId: number;

    if (dto.conversaId) {
      await this.conversasService.buscarConversaDoUsuario(
        dto.conversaId,
        usuarioId,
      );

      conversaId = dto.conversaId;
    } else {
      const conversa =
        await this.conversasService.criarConversa(usuarioId);

      conversaId = conversa.id;
    }

    await this.conversasService.salvarMensagem(
      conversaId,
      RemetenteChat.USER,
      dto.texto,
    );

    try {
      const resposta = await fetch(
        `${this.mlApiUrl}/nlu/parse`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            texto: dto.texto,
          }),
          signal: AbortSignal.timeout(10000),
        },
      );

      if (!resposta.ok) {
        throw new BadGatewayException(
          'O serviço de Machine Learning não conseguiu interpretar a mensagem.',
        );
      }

      const resultado = await resposta.json();

      const confianca = Number(resultado.confianca ?? 0);
      const intencao = String(resultado.intencao ?? 'desconhecida');
      const entidades = resultado.entidades ?? {};

      const equipamentoNome = entidades.equipamento
        ? String(entidades.equipamento)
        : null;

      const conversaAtual =
        await this.conversasService.buscarConversaDoUsuario(
          conversaId,
          usuarioId,
        );

      if (
        conversaAtual.acaoPendente &&
        conversaAtual.acaoPendenteExpiraEm &&
        conversaAtual.acaoPendenteExpiraEm > new Date()
      ) {
        const mensagem =
          'Você ainda possui uma ação aguardando confirmação. Confirme ou cancele essa ação antes de solicitar outra.';

        await this.conversasService.salvarMensagem(
          conversaId,
          RemetenteChat.FITBOT,
          mensagem,
        );

        return {
          sucesso: true,
          conversaId,
          respostaFitBot: mensagem,
          mensagem,
          existeAcaoPendente: true,
        };
      }

      if (conversaAtual.acaoPendente) {
        await this.conversasService.limparAcaoPendente(
          conversaAtual,
        );
      }

      let textoResposta =
        'Não consegui identificar sua solicitação. Posso ajudar com equipamentos e utilizações da academia.';

      let precisaConfirmacao = false;

      if (intencao === 'consultar_equipamento') {
        const equipamentos =
          await this.equipamentosRepository.find({
            where: {
              ativo: true,
              status: StatusEquipamento.DISPONIVEL,
            },
            order: {
              nome: 'ASC',
            },
          });

        if (equipamentos.length === 0) {
          textoResposta =
            'No momento, não temos equipamentos disponíveis para utilização.';
        } else {
          const lista = equipamentos
            .map(
              (equipamento) =>
                `• ${equipamento.nome} (${equipamento.categoria})`,
            )
            .join('\n');

          textoResposta =
            `Temos ${equipamentos.length} equipamento(s) disponível(is):\n${lista}`;
        }
      } else if (intencao === 'iniciar_utilizacao') {
        if (!equipamentoNome) {
          textoResposta =
            'Qual equipamento você deseja utilizar? Informe o nome do aparelho.';
        } else {
          const equipamento =
            await this.equipamentosRepository.findOne({
              where: {
                nome: ILike(equipamentoNome),
                ativo: true,
                status: StatusEquipamento.DISPONIVEL,
              },
            });

          if (!equipamento) {
            textoResposta =
              `Não encontrei o equipamento "${equipamentoNome}" disponível para utilização. Confira o nome e tente novamente.`;
          } else {
            const expiraEm = new Date(
              Date.now() + 5 * 60 * 1000,
            );

            await this.conversasService.salvarAcaoPendente(
              conversaId,
              {
                tipo: 'INICIAR_UTILIZACAO',
                equipamentoId: equipamento.id,
                equipamentoNome: equipamento.nome,
              },
              expiraEm,
            );

            textoResposta =
              `Você deseja iniciar uma utilização no equipamento ${equipamento.nome}? Confirme pelo botão de confirmação ou cancele a solicitação.`;

            precisaConfirmacao = true;
          }
        }
      }

      await this.conversasService.salvarMensagem(
        conversaId,
        RemetenteChat.FITBOT,
        textoResposta,
        {
          intencao,
          equipamento: equipamentoNome,
          confianca,
        },
      );

      return {
        sucesso: true,
        mensagem: 'Mensagem interpretada e salva no histórico.',
        conversaId,
        texto: resultado.texto ?? dto.texto,
        respostaFitBot: textoResposta,
        intencao,
        confianca,
        origem: resultado.origem,
        entidades,
        precisa_confirmacao: precisaConfirmacao,
        acaoPendente: precisaConfirmacao,
      };
    } catch (erro) {
      if (
        erro instanceof BadGatewayException ||
        erro instanceof BadRequestException
      ) {
        throw erro;
      }

      throw new ServiceUnavailableException(
        'Não foi possível conectar ao serviço de Machine Learning ou processar a mensagem. Verifique se a API Python está em execução.',
      );
    }
  }

  async confirmarAcao(
    dto: ConfirmarAcaoDto,
    usuarioId: number,
  ) {
    const conversa =
      await this.conversasService.buscarConversaDoUsuario(
        dto.conversaId,
        usuarioId,
      );

    const acao = conversa.acaoPendente;

    if (!acao) {
      throw new BadRequestException(
        'Não existe nenhuma ação aguardando confirmação nesta conversa.',
      );
    }

    if (
      !conversa.acaoPendenteExpiraEm ||
      conversa.acaoPendenteExpiraEm <= new Date()
    ) {
      await this.conversasService.limparAcaoPendente(conversa);

      const mensagem =
        'A confirmação expirou. Envie novamente sua solicitação para continuar.';

      await this.conversasService.salvarMensagem(
        conversa.id,
        RemetenteChat.FITBOT,
        mensagem,
      );

      return {
        sucesso: false,
        mensagem,
      };
    }

    if (acao.tipo !== 'INICIAR_UTILIZACAO') {
      throw new BadRequestException(
        'Tipo de ação pendente não reconhecido.',
      );
    }

    if (!dto.confirmar) {
      await this.conversasService.limparAcaoPendente(conversa);

      const mensagem =
        'Solicitação cancelada. Nenhuma utilização foi iniciada.';

      await this.conversasService.salvarMensagem(
        conversa.id,
        RemetenteChat.USER,
        'Não, cancelar.',
      );

      await this.conversasService.salvarMensagem(
        conversa.id,
        RemetenteChat.FITBOT,
        mensagem,
      );

      return {
        sucesso: true,
        cancelada: true,
        mensagem,
      };
    }

    const equipamentoId = Number(acao.equipamentoId);

    if (
      !Number.isInteger(equipamentoId) ||
      equipamentoId <= 0
    ) {
      throw new BadRequestException(
        'O equipamento da ação pendente é inválido.',
      );
    }

    const utilizacao = await this.utilizacoesService.iniciar(
      usuarioId,
      { equipamentoId },
    );

    await this.conversasService.limparAcaoPendente(conversa);

    const equipamentoNome = String(
      acao.equipamentoNome ?? 'Equipamento',
    );

    const mensagem =
      `Utilização iniciada com sucesso no equipamento ${equipamentoNome}! Bom treino!`;

    await this.conversasService.salvarMensagem(
      conversa.id,
      RemetenteChat.USER,
      'Sim, iniciar.',
    );

    await this.conversasService.salvarMensagem(
      conversa.id,
      RemetenteChat.FITBOT,
      mensagem,
      {
        intencao: 'iniciar_utilizacao',
        equipamento: equipamentoNome,
      },
    );

    return {
      sucesso: true,
      confirmada: true,
      mensagem,
      utilizacao,
    };
  }
}
