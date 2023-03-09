import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { DashboardService } from 'src/dashboard/dashboard.service';
import { LineChatbotService } from 'src/line-chatbot/line-chatbot.service';
import { LineMessage } from 'src/line-chatbot/types/line-message.type';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  getCurrentShift,
  getShiftTimings,
  isDateToday,
  isNowInTimeShiftRange,
} from 'src/utils/date.utils';
import { CRITERIA } from './criteria.constant';

@Injectable()
export class AlertService {
  constructor(
    private prisma: PrismaService,
    private dashboardService: DashboardService,
    private lineChatBotService: LineChatbotService,
  ) {}

  async alertWhenBelowCriteria(lineId: number, targetDate: string) {
    const now = new Date();
    const currentShift = getCurrentShift(now);
    const timeShift = getShiftTimings(currentShift, 'OVERTIME');
    const isNowInTimeShift = isNowInTimeShiftRange(
      timeShift.startDate,
      timeShift.endDate,
    );

    if (!isNowInTimeShift) return;
    const { lineName } = await this.prisma.line.findUnique({
      where: { lineId },
    });
    if (!lineName) return;
    const criteria = CRITERIA.find(
      (c) => c.lineName.toLowerCase() === lineName.toLowerCase(),
    );
    if (!criteria) return;

    const dashboardDate = await this.dashboardService.getDashboardByDate({
      lineId,
      shift: currentShift,
      targetDate: now.toISOString(),
    });
    const buildMessages = this.buildMessages(dashboardDate, criteria);
    await this.lineChatBotService.pushMessage(buildMessages);
  }

  buildMessages(dashboard, { criteria, lineName }) {
    if (!dashboard) return;
    const { availability, quality, performance, oee } = dashboard;
    const lowerMetrics = [];
    const metrics = [
      { name: 'Availability', value: availability },
      { name: 'Performance', value: performance },
      { name: 'Quality Rate', value: quality },
      { name: 'OEE', value: oee },
    ];
    let lowerMetricsStr = '';

    metrics.forEach((metric) => {
      if (metric.value < criteria[metric.name.toLowerCase()]) {
        lowerMetrics.push(metric);
      }
    });

    if (lowerMetrics.length) {
      lowerMetricsStr = `${lowerMetrics
        .map((metric) => metric.name)
        .join(', ')} ${
        lowerMetrics.length > 1 ? 'are' : 'is'
      } lower than specified\n`;
    } else return;

    const body = metrics
      .map((metric) => {
        const content = `${metric.name}: ${metric.value}%`;
        return lowerMetrics.find((l) => l.name === metric.name)
          ? `** *${content}* **`
          : content;
      })
      .join('\n');
    const template = `Alert: Line ${lineName}\nStatus:\n${body}\n${lowerMetricsStr}`;

    return [{ type: 'text', text: template }];
  }

  //   buildMessages(
  //     { availability, quality, performance, oee },
  //     { criteria, lineName },
  //   ): LineMessage[] {
  //     const lowerList: string[] = [];
  //     let baseBodyList: any[] = [
  //       { name: 'Availability', value: availability },
  //       { name: 'Performance', value: performance },
  //       { name: 'Quality Rate', value: quality },
  //       { name: 'OEE', value: oee },
  //     ];
  //     let strLower = '';
  //     if (availability < criteria.availability) lowerList.push('Availability');
  //     if (quality < criteria.quality) lowerList.push('Quality Rate');
  //     if (performance < criteria.performance) lowerList.push('Performance');
  //     if (oee < criteria.oee) lowerList.push('OEE');
  //     if (lowerList.length) {
  //       strLower += lowerList.length > 1 ? lowerList.join(', ') : lowerList[0];
  //     }
  //     baseBodyList = baseBodyList.map((b) => {
  //       const content = `${b.name} : ${b.value}%`;
  //       const matchLower = lowerList.find((l) => l === b.name);
  //       return matchLower ? `** *${content}* **` : content;
  //     });
  //     const body = `Alert : Line ${lineName}
  // Status :
  // ${baseBodyList.join('\n')}
  // ${strLower} ${lowerList.length > 1 ? 'are' : 'is'} lower than specified`;

  //     const lineMessage: LineMessage[] = [{ type: 'text', text: body }];
  //     return lineMessage;
  //   }
}
