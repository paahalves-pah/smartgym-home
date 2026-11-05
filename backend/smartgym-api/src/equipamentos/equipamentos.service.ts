import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Equipamento } from '../entities/equipamento.entity.js';
import { CriarEquipamentoDto } from './dto/equipamento.dto.js';

@Injectable()
export class EquipamentosService {
  constructor(
    @InjectRepository(Equipamento)
    private readonly equipamentosRepository: Repository<Equipamento>,
  ) {}

  async criar(dados: CriarEquipamentoDto): Promise<Equipamento> {
    const nome = dados.nome.trim();

    const equipamentoExistente =
      await this.equipamentosRepository.findOne({
        where: { nome },
      });

    if (equipamentoExistente) {
      throw new ConflictException(
        'Este equipamento já está cadastrado.',
      );
    }

    const equipamento = this.equipamentosRepository.create({
      ...dados,
      nome,
      categoria: dados.categoria.trim(),
    });

    return this.equipamentosRepository.save(equipamento);
  }

  async listar(): Promise<Equipamento[]> {
    return this.equipamentosRepository.find({
      order: { nome: 'ASC' },
    });
  }

  async buscarPorId(id: number): Promise<Equipamento> {
    const equipamento = await this.equipamentosRepository.findOne({
      where: { id },
    });

    if (!equipamento) {
      throw new NotFoundException(
        'Equipamento não encontrado.',
      );
    }

    return equipamento;
  }

  async atualizar(
    id: number,
    dados: Partial<CriarEquipamentoDto>,
  ): Promise<Equipamento> {
    const equipamento = await this.buscarPorId(id);

    if (dados.nome) {
      const nome = dados.nome.trim();

      const equipamentoExistente =
        await this.equipamentosRepository.findOne({
          where: { nome },
        });

      if (equipamentoExistente && equipamentoExistente.id !== id) {
        throw new ConflictException(
          'Já existe outro equipamento com esse nome.',
        );
      }

      equipamento.nome = nome;
    }

    if (dados.categoria !== undefined) {
      equipamento.categoria = dados.categoria.trim();
    }

    if (dados.descricao !== undefined) {
      equipamento.descricao = dados.descricao;
    }

    if (dados.status !== undefined) {
      equipamento.status = dados.status;
    }

    return this.equipamentosRepository.save(equipamento);
  }

  async excluir(id: number): Promise<void> {
    const equipamento = await this.buscarPorId(id);

    await this.equipamentosRepository.remove(equipamento);
  }


}

