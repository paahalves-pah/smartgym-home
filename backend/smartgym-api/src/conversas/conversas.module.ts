
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Conversa } from '../entities/conversa.entity.js';
import { MensagemChat } from '../entities/mensagem-chat.entity.js';

import { ConversasController } from './conversas.controller.js';
import { ConversasService } from './conversas.service.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Conversa,
      MensagemChat,
    ]),
  ],
  controllers: [ConversasController],
  providers: [ConversasService],
  exports: [ConversasService],
})
export class ConversasModule {}
