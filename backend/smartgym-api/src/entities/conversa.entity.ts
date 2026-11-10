
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';

import type { Relation } from 'typeorm';

import { Usuario } from './usuario.entity.js';
import { MensagemChat } from './mensagem-chat.entity.js';

@Entity('conversas')
export class Conversa {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Usuario, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'usuario_id' })
  usuario: Relation<Usuario>;

  @OneToMany(
    () => MensagemChat,
    (mensagem) => mensagem.conversa,
  )
  mensagens: Relation<MensagemChat[]>;

  @Column({
    name: 'acao_pendente',
    type: 'jsonb',
    nullable: true,
  })
  acaoPendente: Record<string, unknown> | null;

  @Column({
    name: 'acao_pendente_expira_em',
    type: 'timestamp',
    nullable: true,
  })
  acaoPendenteExpiraEm: Date | null;

  @CreateDateColumn({ name: 'criada_em' })
  criadaEm: Date;

  @UpdateDateColumn({ name: 'atualizada_em' })
  atualizadaEm: Date;
}
