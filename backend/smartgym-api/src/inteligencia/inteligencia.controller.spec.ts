import { Test, TestingModule } from '@nestjs/testing';
import { InteligenciaController } from './inteligencia.controller.js';

describe('InteligenciaController', () => {
  let controller: InteligenciaController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [InteligenciaController],
    }).compile();

    controller = module.get<InteligenciaController>(InteligenciaController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
