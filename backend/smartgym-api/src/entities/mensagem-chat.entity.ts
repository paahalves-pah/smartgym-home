
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

import type { Relation } from 'typeorm';

import { Conversa } from './conversa.entity.js';

export enum RemetenteChat {
  USER = 'USER',
  FITBOT = 'FITBOT',
}

@Entity('mensagens_chat')
export class MensagemChat {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(
    () => Conversa,
    (conversa) => conversa.mensagens,
    { nullable: false, onDelete: 'CASCADE' },
  )
  @JoinColumn({ name: 'conversa_id' })
  conversa: Relation<Conversa>;

  @Column({
    type: 'varchar',
    length: 10,
  })
  remetente: RemetenteChat;

  @Column({ type: 'text' })
  conteudo: string;

  @Column({
    type: 'varchar',
    length: 80,
    nullable: true,
  })
  intencao: string | null;

  @Column({
    type: 'varchar',
    length: 150,
    nullable: true,
  })
  equipamento: string | null;

  @Column({
    type: 'decimal',
    precision: 5,
    scale: 4,
    nullable: true,
  })
  confianca: number | null;

  @CreateDateColumn({ name: 'criada_em' })
  criadaEm: Date;
}
