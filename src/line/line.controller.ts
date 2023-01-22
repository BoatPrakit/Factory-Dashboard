import { Body, Controller, Get, Post } from '@nestjs/common';
import { CreateNewLineDto } from './dto/create-new-line.dto';
import { LineService } from './line.service';

@Controller('line')
export class LineController {
  constructor(private lineService: LineService) {}

  @Get()
  async getAllLine() {
    return await this.lineService.findAllLine();
  }

  @Post()
  async createNewLine(@Body() payload: CreateNewLineDto) {
    return await this.lineService.createNewLine(payload);
  }
}
