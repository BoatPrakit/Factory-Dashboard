import { Controller, Post, Body, Param, Get } from '@nestjs/common';
import { FailureDetailService } from './failure-detail.service';
import { CreateFailureDetailDto } from './dto/create-failure-detail.dto';
import { FindAllDetailsDto } from './dto/find-all-details.dto';
import { CreateExtendedFailureDto } from './dto/create-extended-failure.dto';

@Controller('failure-detail')
export class FailureDetailController {
  constructor(private readonly failureDetailService: FailureDetailService) {}

  @Post()
  async create(@Body() createFailureDetailDto: CreateFailureDetailDto) {
    return await this.failureDetailService.create(createFailureDetailDto);
  }

  @Post('extended')
  async createExtendedFailure(@Body() payload: CreateExtendedFailureDto) {
    return await this.failureDetailService.createExtendedFailure(payload);
  }

  @Get('extended/:lineId')
  async findAllExtendedFailure(@Param('lineId') lineId: string) {
    return await this.failureDetailService.findAllExtendedFailureByLineId(
      +lineId,
    );
  }

  @Post('/:lineId')
  async findAllFailDetailByLineId(
    @Param('lineId') lineId: string,
    @Body() payload: FindAllDetailsDto,
  ) {
    return await this.failureDetailService.findAllFailureDetailByLineId(
      +lineId,
      payload,
    );
  }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.failureDetailService.findOne(+id);
  // }

  // @Patch(':id')
  // update(
  //   @Param('id') id: string,
  //   @Body() updateFailureDetailDto: UpdateFailureDetailDto,
  // ) {
  //   return this.failureDetailService.update(+id, updateFailureDetailDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.failureDetailService.remove(+id);
  // }
}
