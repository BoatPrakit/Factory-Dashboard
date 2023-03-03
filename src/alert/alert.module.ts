import { forwardRef, Module } from '@nestjs/common';
import { DashboardModule } from 'src/dashboard/dashboard.module';
import { LineChatbotModule } from 'src/line-chatbot/line-chatbot.module';
import { AlertService } from './alert.service';

@Module({
  imports: [DashboardModule, LineChatbotModule],
  providers: [AlertService],
  exports: [AlertService],
})
export class AlertModule {}
