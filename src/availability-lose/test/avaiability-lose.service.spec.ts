import { Test, TestingModule } from '@nestjs/testing';
import { AvaiabilityLoseService } from './avaiability-lose.service';

describe('AvaiabilityLoseService', () => {
  let service: AvaiabilityLoseService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AvaiabilityLoseService],
    }).compile();

    service = module.get<AvaiabilityLoseService>(AvaiabilityLoseService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
