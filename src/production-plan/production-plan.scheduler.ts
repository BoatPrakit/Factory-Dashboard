import { Injectable } from '@nestjs/common';
import { Cron, CronExpression, SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';
import * as moment from 'moment';
import { AlertService } from 'src/alert/alert.service';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  getCurrentShift,
  getStartDateAndEndDate,
  isNowAfterMidnight,
} from 'src/utils/date.utils';
import { ProductionPlanService } from './production-plan.service';

@Injectable()
export class ProductionPlanScheduler {
  constructor(
    private schedulerRegistry: SchedulerRegistry,
    private productionPlanService: ProductionPlanService,
    private prisma: PrismaService,
    private alertService: AlertService,
  ) {}

  @Cron(CronExpression.EVERY_HOUR, {
    name: 'alert',
    timeZone: 'Asia/Bangkok',
  })
  async handleCron() {
    console.log('fired!', new Date());
    const now = moment('2023-03-31T17:30:24.406Z');
    const currentShift = getCurrentShift(now.toDate());
    const date = getStartDateAndEndDate(now.toISOString());
    if (currentShift === 'NIGHT') {
      if (isNowAfterMidnight(now.toDate())) {
        date.startDate = moment(date.startDate).subtract(1, 'day').toDate();
        date.endDate = moment(date.endDate).subtract(1, 'day').toDate();
      }
    }
    const productionPlanPromises = new Array(3).fill(null).map((p, index) => {
      return this.productionPlanService.findProductionPlansByDate(
        index + 1,
        date,
        currentShift,
      );
    });
    const productionPlans = await Promise.all([...productionPlanPromises]);
    for (const plans of productionPlans) {
      if (plans.length) {
        const plan = plans[0];
        await this.alertService.alertWhenBelowCriteria(
          plan.lineId,
          date.startDate,
          plan.workingTime.type,
          now.toDate(),
        );
      }
    }
  }

  //   addCronJob(name: string, seconds: string) {
  //     const job = new CronJob(`${seconds} * * * * *`, () => {
  //     });

  //     this.schedulerRegistry.addCronJob(name, job);
  //     job.start();

  //     this.logger.warn(
  //       `job ${name} added for each minute at ${seconds} seconds!`,
  //     );
  //   }
}
