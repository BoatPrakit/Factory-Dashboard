import { Test, TestingModule } from '@nestjs/testing';
import { WorkingTimeController } from '../working-time.controller';
import { WorkingTimeService } from '../working-time.service';

describe('WorkingTimeController', () => {
  let controller: WorkingTimeController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WorkingTimeController],
      providers: [WorkingTimeService],
    }).compile();

    controller = module.get<WorkingTimeController>(WorkingTimeController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
