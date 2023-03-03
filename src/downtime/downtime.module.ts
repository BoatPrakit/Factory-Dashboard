import { Module } from '@nestjs/common';
import { DowntimeService } from './downtime.service';
import { DowntimeController } from './downtime.controller';
import { WorkingTimeModule } from 'src/working-time/working-time.module';
import { AlertModule } from 'src/alert/alert.module';

@Module({
  imports: [WorkingTimeModule, AlertModule],
  controllers: [DowntimeController],
  providers: [DowntimeService],
})
export class DowntimeModule {}
