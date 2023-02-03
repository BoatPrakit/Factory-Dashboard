import { Module } from '@nestjs/common';
import { AvailabilityLoseService } from './availability-lose.service';
import { AvailabilityLoseController } from './availability-lose.controller';

@Module({
  controllers: [AvailabilityLoseController],
  providers: [AvailabilityLoseService],
})
export class AvaiabilityLoseModule {}
