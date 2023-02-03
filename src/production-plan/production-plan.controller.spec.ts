import { Test, TestingModule } from '@nestjs/testing';
import { ProductionPlanController } from './production-plan.controller';
import { ProductionPlanService } from './production-plan.service';

describe('ProductionPlanController', () => {
  let controller: ProductionPlanController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductionPlanController],
      providers: [ProductionPlanService],
    }).compile();

    controller = module.get<ProductionPlanController>(ProductionPlanController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
