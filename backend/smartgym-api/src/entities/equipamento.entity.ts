import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';

import { Manutencao } from './manutencao.entity.js';

export enum StatusEquipamento {
  DISPONIVEL = 'DISPONIVEL',
  EM_USO = 'EM_USO',
  EM_MANUTENCAO = 'EM_MANUTENCAO',
  INATIVO = 'INATIVO',
}

@Entity('equipamentos')
export class Equipamento {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 150 })
  nome: string;

  @Column({ length: 100 })
  categoria: string;

  @Column({ type: 'text', nullable: true })
  descricao: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  imagem: string | null;

  @Column({
    name: 'status',
    type: 'enum',
    enum: StatusEquipamento,
    default: StatusEquipamento.DISPONIVEL,
  })
  status: StatusEquipamento;

  @Column({ default: true })
  ativo: boolean;

  @CreateDateColumn({ name: 'criado_em' })
  criadoEm: Date;

  @OneToMany(() => Manutencao, (manutencao) => manutencao.equipamento)
  manutencoes: Manutencao[];
}