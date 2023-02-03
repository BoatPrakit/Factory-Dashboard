import { Test, TestingModule } from '@nestjs/testing';
import { DowntimeService } from './downtime.service';

describe('DowntimeService', () => {
  let service: DowntimeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DowntimeService],
    }).compile();

    service = module.get<DowntimeService>(DowntimeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
