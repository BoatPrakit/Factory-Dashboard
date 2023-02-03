import { Test, TestingModule } from '@nestjs/testing';
import { DowntimeController } from './downtime.controller';
import { DowntimeService } from './downtime.service';

describe('DowntimeController', () => {
  let controller: DowntimeController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DowntimeController],
      providers: [DowntimeService],
    }).compile();

    controller = module.get<DowntimeController>(DowntimeController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
