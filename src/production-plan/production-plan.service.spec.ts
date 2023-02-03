import { Test, TestingModule } from '@nestjs/testing';
import { ProductionPlanService } from './production-plan.service';

describe('ProductionPlanService', () => {
  let service: ProductionPlanService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProductionPlanService],
    }).compile();

    service = module.get<ProductionPlanService>(ProductionPlanService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
