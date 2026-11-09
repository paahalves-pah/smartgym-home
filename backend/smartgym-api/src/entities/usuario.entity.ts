import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';

import type { Relation } from 'typeorm';

import { Manutencao } from './manutencao.entity.js';

export enum TipoUsuario {
  USER = 'USER',
  ADMIN = 'ADMIN',
}

@Entity('usuarios')
export class Usuario {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 150 })
  nome: string;

  @Column({ unique: true, length: 150 })
  email: string;

  @Column({ name: 'senha_hash' })
  senhaHash: string;

  @Column({
    name: 'tipo_usuario',
    type: 'enum',
    enum: TipoUsuario,
    default: TipoUsuario.USER,
  })
  tipoUsuario: TipoUsuario;

  @Column({ default: true })
  ativo: boolean;

  @Column({
    name: 'foto_url',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  fotoUrl: string | null;

  @CreateDateColumn({ name: 'criado_em' })
  criadoEm: Date;

  @OneToMany(
    () => Manutencao,
    (manutencao) => manutencao.responsavelUsuario,
  )
  manutencoesResponsavel: Relation<Manutencao[]>;
}