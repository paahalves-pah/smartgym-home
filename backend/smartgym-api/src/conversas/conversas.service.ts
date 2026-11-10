
import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Conversa } from '../entities/conversa.entity.js';
import {
  MensagemChat,
  RemetenteChat,
} from '../entities/mensagem-chat.entity.js';
import { Usuario } from '../entities/usuario.entity.js';

@Injectable()
export class ConversasService {
  constructor(
    @InjectRepository(Conversa)
    private readonly conversasRepository: Repository<Conversa>,

    @InjectRepository(MensagemChat)
    private readonly mensagensRepository: Repository<MensagemChat>,
  ) {}

  async criarConversa(usuarioId: number) {
    const conversa = this.conversasRepository.create({
      usuario: { id: usuarioId } as Usuario,
    });

    return this.conversasRepository.save(conversa);
  }

  async buscarConversaDoUsuario(
    conversaId: number,
    usuarioId: number,
  ) {
    const conversa = await this.conversasRepository.findOne({
      where: {
        id: conversaId,
        usuario: { id: usuarioId },
      },
    });

    if (!conversa) {
      throw new NotFoundException('Conversa não encontrada.');
    }

    return conversa;
  }

  async salvarMensagem(
    conversaId: number,
    remetente: RemetenteChat,
    conteudo: string,
    dados?: {
      intencao?: string | null;
      equipamento?: string | null;
      confianca?: number | null;
    },
  ) {
    const mensagem = this.mensagensRepository.create({
      conversa: { id: conversaId } as Conversa,
      remetente,
      conteudo,
      intencao: dados?.intencao ?? null,
      equipamento: dados?.equipamento ?? null,
      confianca: dados?.confianca ?? null,
    });

    return this.mensagensRepository.save(mensagem);
  }

  async salvarAcaoPendente(
    conversaId: number,
    acao: Record<string, unknown>,
    expiraEm: Date,
  ) {
    const conversa = await this.conversasRepository.findOne({
      where: { id: conversaId },
    });

    if (!conversa) {
      throw new NotFoundException('Conversa não encontrada.');
    }

    conversa.acaoPendente = acao;
    conversa.acaoPendenteExpiraEm = expiraEm;

    return this.conversasRepository.save(conversa);
  }

  async limparAcaoPendente(conversa: Conversa) {
    conversa.acaoPendente = null;
    conversa.acaoPendenteExpiraEm = null;

    return this.conversasRepository.save(conversa);
  }

  async listarConversas(usuarioId: number) {
    const conversas = await this.conversasRepository.find({
      where: {
        usuario: { id: usuarioId },
      },
      order: {
        atualizadaEm: 'DESC',
      },
    });

    return conversas.map((conversa) => ({
      id: conversa.id,
      criadaEm: conversa.criadaEm,
      atualizadaEm: conversa.atualizadaEm,
    }));
  }

  async buscarHistorico(
    conversaId: number,
    usuarioId: number,
  ) {
    await this.buscarConversaDoUsuario(
      conversaId,
      usuarioId,
    );

    const mensagens = await this.mensagensRepository.find({
      where: {
        conversa: { id: conversaId },
      },
      order: {
        criadaEm: 'ASC',
      },
    });

    return {
      conversaId,
      mensagens,
    };
  }
}
