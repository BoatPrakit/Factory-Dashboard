import { Body, Controller, Get, Post } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Post('test/line-message')
  async testLineMessage(@Body() message: { message: string }) {
    return await this.appService.testLineMessage(message.message);
  }
}
