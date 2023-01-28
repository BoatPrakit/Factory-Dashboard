import { Test, TestingModule } from '@nestjs/testing';
import { FailureDetailController } from '../failure-detail.controller';
import { FailureDetailService } from '../failure-detail.service';

describe('FailureDetailController', () => {
  let controller: FailureDetailController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FailureDetailController],
      providers: [FailureDetailService],
    }).compile();

    controller = module.get<FailureDetailController>(FailureDetailController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
