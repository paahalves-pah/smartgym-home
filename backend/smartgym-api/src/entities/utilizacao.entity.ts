import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

import { Usuario } from './usuario.entity.js';
import { Equipamento } from './equipamento.entity.js';

export enum StatusUtilizacao {
  EM_ANDAMENTO = 'EM_ANDAMENTO',
  FINALIZADA = 'FINALIZADA',
}

@Entity('utilizacoes')
export class Utilizacao {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Usuario, { nullable: false })
  @JoinColumn({ name: 'usuario_id' })
  usuario: Usuario;

  @ManyToOne(() => Equipamento, { nullable: false })
  @JoinColumn({ name: 'equipamento_id' })
  equipamento: Equipamento;

  @CreateDateColumn({ name: 'inicio_em' })
  inicioEm: Date;

  @Column({
    name: 'fim_em',
    type: 'timestamp',
    nullable: true,
  })
  fimEm: Date | null;

  @Column({
    type: 'enum',
    enum: StatusUtilizacao,
    default: StatusUtilizacao.EM_ANDAMENTO,
  })
  status: StatusUtilizacao;
}
