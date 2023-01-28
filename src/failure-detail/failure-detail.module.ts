import { Module } from '@nestjs/common';
import { FailureDetailService } from './failure-detail.service';
import { FailureDetailController } from './failure-detail.controller';

@Module({
  controllers: [FailureDetailController],
  providers: [FailureDetailService]
})
export class FailureDetailModule {}
