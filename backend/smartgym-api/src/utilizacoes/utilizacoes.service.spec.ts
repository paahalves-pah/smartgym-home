import { Test, TestingModule } from '@nestjs/testing';
import { UtilizacoesService } from './utilizacoes.service.js';

describe('UtilizacoesService', () => {
  let service: UtilizacoesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UtilizacoesService],
    }).compile();

    service = module.get<UtilizacoesService>(UtilizacoesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
