import { Module } from '@nestjs/common';
import { LineChatbotService } from './line-chatbot.service';
import { LineChatbotController } from './line-chatbot.controller';

@Module({
  controllers: [LineChatbotController],
  providers: [LineChatbotService],
  exports: [LineChatbotService],
})
export class LineChatbotModule {}
