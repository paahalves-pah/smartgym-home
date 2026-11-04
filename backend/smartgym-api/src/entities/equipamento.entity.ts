
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

export enum StatusEquipamento {
  DISPONIVEL = 'DISPONIVEL',
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
}
