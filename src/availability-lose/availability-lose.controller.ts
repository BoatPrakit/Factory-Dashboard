import { Body, Controller, Post } from '@nestjs/common';
import { AvailabilityLoseService } from './availability-lose.service';
import { CreateAvailabilityLoseDto } from './dto/create-availability-lose.dto';

@Controller('availability-lose')
export class AvailabilityLoseController {
  constructor(
    private readonly availabilityLoseService: AvailabilityLoseService,
  ) {}

  @Post()
  async create(@Body() payload: CreateAvailabilityLoseDto) {
    return await this.availabilityLoseService.create(payload);
  }
}
