import { Module } from '@nestjs/common';
import { DowntimeService } from './downtime.service';
import { DowntimeController } from './downtime.controller';
import { WorkingTimeModule } from 'src/working-time/working-time.module';

@Module({
  imports: [WorkingTimeModule],
  controllers: [DowntimeController],
  providers: [DowntimeService],
})
export class DowntimeModule {}
