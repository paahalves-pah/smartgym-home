
import {
  Injectable,
  ServiceUnavailableException,
  BadGatewayException,
} from '@nestjs/common';

import { ConfigService } from '@nestjs/config';
import Groq from 'groq-sdk';

import { RecomendacaoDto } from './dto/recomendacao.dto.js';

@Injectable()
export class InteligenciaService {
  private readonly groq: Groq;

  constructor(
    private readonly configService: ConfigService,
  ) {
    const apiKey = this.configService.get<string>(
      'GROQ_API_KEY',
    );

    if (!apiKey) {
      throw new ServiceUnavailableException(
        'A chave da Groq não está configurada.',
      );
    }

    this.groq = new Groq({ apiKey });
  }

  async gerarRecomendacoes(dto: RecomendacaoDto) {
    try {
      const resposta =
        await this.groq.chat.completions.create({
          model: 'openai/gpt-oss-20b',

          messages: [
            {
              role: 'system',
              content:
                'Você é um assistente especializado em Smart Home e gestão inteligente de academias. Gere recomendações práticas, claras e seguras com base no contexto fornecido. Não invente dados que não foram informados.',
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
}
