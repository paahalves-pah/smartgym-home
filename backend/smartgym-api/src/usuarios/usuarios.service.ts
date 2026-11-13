
import {
  Injectable,
  ConflictException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

import {
  Usuario,
  TipoUsuario,
} from '../entities/usuario.entity.js';

import { CriarUsuarioDto } from './dto/criar-usuario.dto.js';
import { AtualizarUsuarioDto } from './dto/atualizar-usuario.dto.js';
import { Utilizacao, StatusUtilizacao } from '../entities/utilizacao.entity.js';

type UsuarioPublico = Omit<Usuario, 'senhaHash'>;

interface UsuarioLogado {
  id: number;
  email: string;
  tipoUsuario: string;
}

@Injectable()
export class UsuariosService {
  constructor(
    @InjectRepository(Usuario)
    private readonly usuariosRepository: Repository<Usuario>,
    private readonly dataSource: DataSource,
  ) {}

  private removerSenha(usuario: Usuario): UsuarioPublico {
    const { senhaHash, ...usuarioPublico } = usuario;

    return usuarioPublico;
  }

  async criar(
    dados: CriarUsuarioDto,
  ): Promise<UsuarioPublico> {
    const email = dados.email.trim().toLowerCase();

    const usuarioExistente = await this.usuariosRepository.findOne({
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
      tipoUsuario: dados.tipoUsuario,
    });

    const usuarioSalvo = await this.usuariosRepository.save(usuario);

    return this.removerSenha(usuarioSalvo);
  }

  async buscarPorEmail(email: string): Promise<Usuario | null> {
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
    usuarioLogado: UsuarioLogado,
  ): Promise<UsuarioPublico> {
    const usuario = await this.usuariosRepository.findOne({
      where: { id },
    });

    if (!usuario) {
      throw new NotFoundException('Usuário não encontrado.');
    }

    const isAdmin = usuarioLogado.tipoUsuario === 'ADMIN';

    if (!isAdmin && usuarioLogado.id !== id) {
      throw new ForbiddenException(
        'Você não tem permissão para alterar este usuário.',
      );
    }

    if (
      !isAdmin &&
      (
        dados.email !== undefined ||
        dados.ativo !== undefined ||
        dados.tipoUsuario !== undefined
      )
    ) {
      throw new ForbiddenException(
        'Você só pode alterar seu próprio nome e senha.',
      );
    }

    if (dados.nome !== undefined) {
      usuario.nome = dados.nome.trim();
    }

    if (isAdmin && dados.email !== undefined) {
      const email = dados.email.trim().toLowerCase();

      const usuarioExistente = await this.usuariosRepository.findOne({
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

    if (isAdmin && dados.ativo !== undefined) {
      if (
        usuario.tipoUsuario === TipoUsuario.ADMIN &&
        dados.ativo === false
      ) {
        throw new ForbiddenException(
          'Não é permitido desativar uma conta de administrador.',
        );
      }

      usuario.ativo = dados.ativo;
    }

    if (isAdmin && dados.tipoUsuario !== undefined) {
      if (
        usuario.tipoUsuario === TipoUsuario.ADMIN &&
        dados.tipoUsuario === TipoUsuario.USER &&
        usuario.ativo
      ) {
        const administradoresAtivos =
          await this.usuariosRepository.count({
            where: {
              tipoUsuario: TipoUsuario.ADMIN,
              ativo: true,
            },
          });

        if (administradoresAtivos <= 1) {
          throw new ForbiddenException(
            'Não é possível alterar o último administrador ativo para usuário comum.',
          );
        }
      }

      usuario.tipoUsuario = dados.tipoUsuario;
    }

    const usuarioAtualizado = await this.usuariosRepository.save(usuario);

    return this.removerSenha(usuarioAtualizado);
  }

  async atualizarFoto(
    id: number,
    fotoUrl: string,
  ): Promise<UsuarioPublico> {
    const usuario = await this.usuariosRepository.findOne({
      where: { id },
    });

    if (!usuario) {
      throw new NotFoundException('Usuário não encontrado.');
    }

    usuario.fotoUrl = fotoUrl;

    const usuarioAtualizado = await this.usuariosRepository.save(usuario);

    return this.removerSenha(usuarioAtualizado);
  }

  async excluir(id: number): Promise<void> {
    await this.dataSource.transaction(async (manager) => {
      const usuariosRepository = manager.getRepository(Usuario);
      const utilizacoesRepository = manager.getRepository(Utilizacao);

      const usuario = await usuariosRepository.findOne({
        where: { id },
        lock: { mode: 'pessimistic_write' },
      });

      if (!usuario) {
        throw new NotFoundException('Usuário não encontrado.');
      }

      if (usuario.tipoUsuario === TipoUsuario.ADMIN) {
        throw new ForbiddenException(
          'Não é permitido excluir uma conta de administrador.',
        );
      }

      const utilizacoesEmAndamento = await utilizacoesRepository.count({
        where: {
          usuario: { id },
          status: StatusUtilizacao.EM_ANDAMENTO,
        },
      });

      if (utilizacoesEmAndamento > 0) {
        throw new ForbiddenException(
          'Não é possível excluir este usuário enquanto houver utilização em andamento. Finalize a utilização primeiro.',
        );
      }

      await usuariosRepository.remove(usuario);
    });
  }
}
