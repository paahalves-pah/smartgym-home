import { Test, TestingModule } from '@nestjs/testing';
import { InteligenciaService } from './inteligencia.service.js';

describe('InteligenciaService', () => {
  let service: InteligenciaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [InteligenciaService],
    }).compile();

    service = module.get<InteligenciaService>(InteligenciaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
