
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

import type { Relation } from 'typeorm';

import { Equipamento } from './equipamento.entity.js';
import { Usuario } from './usuario.entity.js';

export enum TipoManutencao {
  PREVENTIVA = 'PREVENTIVA',
  CORRETIVA = 'CORRETIVA',
}

export enum StatusManutencao {
  AGENDADA = 'AGENDADA',
  EM_ANDAMENTO = 'EM_ANDAMENTO',
  CONCLUIDA = 'CONCLUIDA',
  CANCELADA = 'CANCELADA',
}

@Entity('manutencoes')
export class Manutencao {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(
    () => Equipamento,
    (equipamento) => equipamento.manutencoes,
    { nullable: false },
  )
  @JoinColumn({ name: 'equipamento_id' })
  equipamento: Relation<Equipamento>;

  @ManyToOne(
    () => Usuario,
    (usuario) => usuario.manutencoesResponsavel,
    { nullable: true, onDelete: 'SET NULL' },
  )
  @JoinColumn({ name: 'responsavel_id' })
  responsavelUsuario: Relation<Usuario> | null;

  @Column({
    type: 'enum',
    enum: TipoManutencao,
  })
  tipo: TipoManutencao;

  @Column({ type: 'text' })
  descricao: string;

  @Column({
    name: 'data_prevista',
    type: 'timestamp',
  })
  dataPrevista: Date;

  @Column({
    name: 'data_inicio',
    type: 'timestamp',
    nullable: true,
  })
  dataInicio: Date | null;

  @Column({
    name: 'data_conclusao',
    type: 'timestamp',
    nullable: true,
  })
  dataConclusao: Date | null;

  @Column({
    type: 'enum',
    enum: StatusManutencao,
    default: StatusManutencao.AGENDADA,
  })
  status: StatusManutencao;

  @Column({
    type: 'varchar',
    length: 150,
    nullable: true,
  })
  responsavel: string | null;

  @Column({
    type: 'text',
    nullable: true,
  })
  observacoes: string | null;

  @CreateDateColumn({ name: 'criado_em' })
  criadoEm: Date;
}
