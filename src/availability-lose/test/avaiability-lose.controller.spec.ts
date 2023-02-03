import { Test, TestingModule } from '@nestjs/testing';
import { AvaiabilityLoseController } from '../availability-lose.controller';
import { AvaiabilityLoseService } from '../availability-lose.service';

describe('AvaiabilityLoseController', () => {
  let controller: AvaiabilityLoseController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AvaiabilityLoseController],
      providers: [AvaiabilityLoseService],
    }).compile();

    controller = module.get<AvaiabilityLoseController>(
      AvaiabilityLoseController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
