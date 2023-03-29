import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import axiosLineInstance from './axios-line.instance';
import { LineMessage } from './types/line-message.type';
import { LineEvent } from './types/line-payload.type';

@Injectable()
export class LineChatbotService {
  constructor(private prisma: PrismaService) {}

  async reply(payload: LineEvent) {
    console.log(payload);
    if (payload?.replyToken) {
      const dataString = JSON.stringify({
        replyToken: payload.replyToken,
        messages: [
          {
            type: 'text',
            text: 'Hello, user',
          },
          {
            type: 'text',
            text: 'May I help you?',
          },
        ],
      });
      // Request header
      await axiosLineInstance.post('/message/reply', dataString);
    }
  }

  async pushMessage(messages: LineMessage[]) {
    if (!messages?.length) return;
    const lineId = process.env.LINE_ID || 'C3a469b13c0cfcb567f85725eb09082e5';
    const dataString = JSON.stringify({
      to: lineId,
      messages,
    });
    await axiosLineInstance.post('/message/push', dataString);
  }
}
