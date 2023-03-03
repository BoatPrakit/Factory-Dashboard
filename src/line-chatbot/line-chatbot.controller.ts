import { Body, Controller, Post } from '@nestjs/common';
import { LineChatbotService } from './line-chatbot.service';
import { LinePayload } from './types/line-payload.type';

@Controller('line-chatbot')
export class LineChatbotController {
  constructor(private readonly lineChatbotService: LineChatbotService) {}

  @Post('webhook')
  async webhook(@Body() payload: LinePayload) {
    const lineEvent = payload.events[0];
    this.lineChatbotService.reply(lineEvent);
    return {};
  }
}
