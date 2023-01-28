import { Test, TestingModule } from '@nestjs/testing';
import { FailureDetailService } from './failure-detail.service';

describe('FailureDetailService', () => {
  let service: FailureDetailService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FailureDetailService],
    }).compile();

    service = module.get<FailureDetailService>(FailureDetailService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
