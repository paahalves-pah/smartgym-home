import { Test, TestingModule } from '@nestjs/testing';
import { UtilizacoesController } from './utilizacoes.controller.js';

describe('UtilizacoesController', () => {
  let controller: UtilizacoesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UtilizacoesController],
    }).compile();

    controller = module.get<UtilizacoesController>(UtilizacoesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
