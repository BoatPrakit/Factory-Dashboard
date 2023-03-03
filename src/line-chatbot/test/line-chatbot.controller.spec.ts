import { Test, TestingModule } from '@nestjs/testing';
import { LineChatbotController } from '../line-chatbot.controller';
import { LineChatbotService } from '../line-chatbot.service';

describe('LineChatbotController', () => {
  let controller: LineChatbotController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LineChatbotController],
      providers: [LineChatbotService],
    }).compile();

    controller = module.get<LineChatbotController>(LineChatbotController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
