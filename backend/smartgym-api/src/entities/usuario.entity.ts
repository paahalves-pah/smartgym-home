
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

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

  @CreateDateColumn({ name: 'criado_em' })
  criadoEm: Date;
}
