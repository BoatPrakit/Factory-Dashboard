import { Injectable } from '@nestjs/common';
import { AlertService } from './alert/alert.service';
import { LineChatbotService } from './line-chatbot/line-chatbot.service';
import { LineService } from './line/line.service';

@Injectable()
export class AppService {
  constructor(private lineService: LineChatbotService) {}
  getHello(): string {
    return 'Hello World!';
  }

  async testLineMessage(message: string) {
    await this.lineService.pushMessage([
      {
        text: message,
        type: 'text',
      },
    ]);
  }
}
