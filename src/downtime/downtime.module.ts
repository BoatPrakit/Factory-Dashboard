import { Module } from '@nestjs/common';
import { DowntimeService } from './downtime.service';
import { DowntimeController } from './downtime.controller';
import { EmployeeModule } from 'src/employee/employee.module';

@Module({
  imports: [EmployeeModule],
  controllers: [DowntimeController],
  providers: [DowntimeService],
})
export class DowntimeModule {}
