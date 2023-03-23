import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { AvailabilityLoseService } from './availability-lose.service';
import { CreateAvailabilityLoseDto } from './dto/create-availability-lose.dto';
import { CreateExtendedAvailabilityDto } from './dto/create-extended-availability.dto';

@Controller('availability-lose')
export class AvailabilityLoseController {
  constructor(
    private readonly availabilityLoseService: AvailabilityLoseService,
  ) {}

  @Post()
  async create(@Body() payload: CreateAvailabilityLoseDto) {
    return await this.availabilityLoseService.create(payload);
  }

  @Post('extended')
  async createExtendedAvailability(
    @Body() payload: CreateExtendedAvailabilityDto,
  ) {
    return await this.availabilityLoseService.createExtendedAvailability(
      payload,
    );
  }

  @Get('/:lineId')
  async getAvailabilityLoseByLineId(@Param('lineId') lineId: string) {
    return await this.availabilityLoseService.findManyByLineId(+lineId);
  }

  @Get('/extended/:lineId')
  async getExtendedAvailabilityByLineId(@Param('lineId') lineId: string) {
    return await this.availabilityLoseService.findManyExtendedAvailability(
      +lineId,
    );
  }
}
