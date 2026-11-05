import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

import { Usuario } from '../entities/usuario.entity.js';
import { AtualizarUsuarioDto } from './dto/atualizar-usuario.dto.js';

type UsuarioPublico = Omit<Usuario, 'senhaHash'>;

@Injectable()
export class UsuariosService {
  constructor(
    @InjectRepository(Usuario)
    private readonly usuariosRepository: Repository<Usuario>,
  ) {}

  private removerSenha(usuario: Usuario): UsuarioPublico {
    const { senhaHash, ...usuarioPublico } = usuario;

    return usuarioPublico;
  }

  async criar(dados: {
    nome: string;
    email: string;
    senha: string;
  }): Promise<UsuarioPublico> {
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

    const senhaHash = await bcrypt.hash(dados.senha, 10);

    const usuario = this.usuariosRepository.create({
      nome: dados.nome.trim(),
      email,
      senhaHash,
    });

    const usuarioSalvo =
      await this.usuariosRepository.save(usuario);

    return this.removerSenha(usuarioSalvo);
  }

  async buscarPorEmail(
    email: string,
  ): Promise<Usuario | null> {
    return this.usuariosRepository.findOne({
      where: {
        email: email.trim().toLowerCase(),
      },
    });
  }

  async listar(): Promise<UsuarioPublico[]> {
    const usuarios = await this.usuariosRepository.find({
      order: { nome: 'ASC' },
    });

    return usuarios.map((usuario) =>
      this.removerSenha(usuario),
    );
  }

  async buscarPorId(id: number): Promise<UsuarioPublico> {
    const usuario = await this.usuariosRepository.findOne({
      where: { id },
    });

    if (!usuario) {
      throw new NotFoundException('Usuário não encontrado.');
    }

    return this.removerSenha(usuario);
  }

  async atualizar(
    id: number,
    dados: AtualizarUsuarioDto,
  ): Promise<UsuarioPublico> {
    const usuario = await this.usuariosRepository.findOne({
      where: { id },
    });

    if (!usuario) {
      throw new NotFoundException('Usuário não encontrado.');
    }

    if (dados.nome !== undefined) {
      usuario.nome = dados.nome.trim();
    }

    if (dados.email !== undefined) {
      const email = dados.email.trim().toLowerCase();

      const usuarioExistente =
        await this.usuariosRepository.findOne({
          where: { email },
        });

      if (usuarioExistente && usuarioExistente.id !== id) {
        throw new ConflictException(
          'Este e-mail já está cadastrado para outro usuário.',
        );
      }

      usuario.email = email;
    }

    if (dados.senha !== undefined) {
      usuario.senhaHash = await bcrypt.hash(dados.senha, 10);
    }

    const usuarioAtualizado =
      await this.usuariosRepository.save(usuario);

    return this.removerSenha(usuarioAtualizado);
  }

  async excluir(id: number): Promise<void> {
    const usuario = await this.usuariosRepository.findOne({
      where: { id },
    });

    if (!usuario) {
      throw new NotFoundException('Usuário não encontrado.');
    }

    await this.usuariosRepository.remove(usuario);
  }
}