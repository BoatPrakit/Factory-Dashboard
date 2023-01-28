import { Controller, Post, Body } from '@nestjs/common';
import { WorkingTimeService } from './working-time.service';
import { CreateWorkingTimeDto } from './dto/create-working-time.dto';

@Controller('working-time')
export class WorkingTimeController {
  constructor(private readonly workingTimeService: WorkingTimeService) {}

  @Post()
  create(@Body() createWorkingTimeDto: CreateWorkingTimeDto) {
    return this.workingTimeService.create(createWorkingTimeDto);
  }

  // @Get()
  // findAll() {
  //   return this.workingTimeService.findAll();
  // }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.workingTimeService.findOne(+id);
  // }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateWorkingTimeDto: UpdateWorkingTimeDto) {
  //   return this.workingTimeService.update(+id, updateWorkingTimeDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.workingTimeService.remove(+id);
  // }
}
