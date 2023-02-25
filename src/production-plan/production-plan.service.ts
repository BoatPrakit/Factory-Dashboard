import { BadRequestException, Injectable } from '@nestjs/common';
import { SHIFT } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateProductionPlanDto } from './dto/create-production-plan.dto';

@Injectable()
export class ProductionPlanService {
  constructor(private prisma: PrismaService) {}

  async create(createProductionPlanDto: CreateProductionPlanDto) {
    const productionPlanPromises = [];
    for (const plan of createProductionPlanDto.plans) {
      const workingTime = await this.prisma.workingTime.findFirst({
        where: {
          lineId: plan.lineId,
          shift: plan.shift,
          type: plan.workingTimeType,
        },
      });
      if (!workingTime) throw new BadRequestException('working time not found');
      const planPromise = this.prisma.productionPlan.create({
        data: {
          group: plan.group,
          timestamp: plan.date,
          target: plan.target,
          line: { connect: { lineId: plan.lineId } },
          workingTime: {
            connect: { workingTimeId: workingTime.workingTimeId },
          },
        },
      });
      productionPlanPromises.push(planPromise);
    }
    const productionPlans = await Promise.all([...productionPlanPromises]);
    return productionPlans;
  }

  async findProductionPlansByDate(
    lineId: number,
    {
      startDate,
      endDate,
    }: {
      startDate: Date;
      endDate: Date;
    },
    shift?: SHIFT,
  ) {
    return await this.prisma.productionPlan.findMany({
      where: {
        lineId,
        timestamp: { gte: startDate, lte: endDate },
        workingTime: shift ? { shift } : undefined,
      },
      include: { workingTime: true },
    });
  }
}
