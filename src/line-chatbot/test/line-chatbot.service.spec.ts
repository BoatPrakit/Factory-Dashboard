import { Test, TestingModule } from '@nestjs/testing';
import { LineChatbotService } from './line-chatbot.service';

describe('LineChatbotService', () => {
  let service: LineChatbotService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LineChatbotService],
    }).compile();

    service = module.get<LineChatbotService>(LineChatbotService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
