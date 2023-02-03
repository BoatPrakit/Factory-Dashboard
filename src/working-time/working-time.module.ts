import { Module } from '@nestjs/common';
import { WorkingTimeService } from './working-time.service';
import { WorkingTimeController } from './working-time.controller';

@Module({
  controllers: [WorkingTimeController],
  providers: [WorkingTimeService],
})
export class WorkingTimeModule {}
