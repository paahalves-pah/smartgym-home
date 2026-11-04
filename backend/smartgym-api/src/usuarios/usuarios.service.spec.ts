
import {
  Injectable,
  ConflictException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

import { Usuario } from '../entities/usuario.entity.js';

@Injectable()
export class UsuariosService {
  constructor(
    @InjectRepository(Usuario)
    private readonly usuariosRepository: Repository<Usuario>,
  ) {}

  async criar(dados: {
    nome: string;
    email: string;
    senha: string;
  }): Promise<Omit<Usuario, 'senhaHash'>> {
    const email = dados.email.trim().toLowerCase();

    const usuarioExistente =
      await this.usuariosRepository.findOne({
        where: { email },
      });

    if (usuarioExistente) {
      throw new ConflictException(
        'Este e-mail já está cadastrado.',
      );
    }

    const senhaHash = await bcrypt.hash(
      dados.senha,
      10,
    );

    const usuario = this.usuariosRepository.create({
      nome: dados.nome.trim(),
      email,
      senhaHash,
    });

    const usuarioSalvo =
      await this.usuariosRepository.save(usuario);

    return {
      id: usuarioSalvo.id,
      nome: usuarioSalvo.nome,
      email: usuarioSalvo.email,
      tipoUsuario: usuarioSalvo.tipoUsuario,
      ativo: usuarioSalvo.ativo,
      criadoEm: usuarioSalvo.criadoEm,
    };
  }
}
