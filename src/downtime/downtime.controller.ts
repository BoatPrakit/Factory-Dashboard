import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { DowntimeService } from './downtime.service';
import { CreateDowntimeDto } from './dto/create-downtime.dto';
import { CreatePaintDowntimeDto } from './dto/create-paint-downtime.dto';
import { UpdateDowntimeDto } from './dto/update-downtime.dto';

@Controller('downtime')
export class DowntimeController {
  constructor(private readonly downtimeService: DowntimeService) {}

  @Post()
  async create(@Body() createDowntimeDto: CreateDowntimeDto) {
    return await this.downtimeService.create(createDowntimeDto);
  }

  @Post('paint')
  async createPaintDowntime(@Body() payload: CreatePaintDowntimeDto) {
    return await this.downtimeService.create(payload);
  }
}
