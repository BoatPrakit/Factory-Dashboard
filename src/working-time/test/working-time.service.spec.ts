import { Test, TestingModule } from '@nestjs/testing';
import { WorkingTimeService } from './working-time.service';

describe('WorkingTimeService', () => {
  let service: WorkingTimeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [WorkingTimeService],
    }).compile();

    service = module.get<WorkingTimeService>(WorkingTimeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
