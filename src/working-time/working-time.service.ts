import { Injectable } from '@nestjs/common';
import { SHIFT, WORKING_TIME_TYPE } from '@prisma/client';
import * as moment from 'moment';
import { PrismaService } from 'src/prisma/prisma.service';
import { TIME_RANGE } from 'src/utils/time-range';
import { CreateWorkingTimeDto } from './dto/create-working-time.dto';

@Injectable()
export class WorkingTimeService {
  constructor(private prisma: PrismaService) {}
  async create(createWorkingTimeDto: CreateWorkingTimeDto) {
    return await this.prisma.workingTime.create({
      data: { ...createWorkingTimeDto },
    });
  }

  async findOneByShift(lineId: number, shift: SHIFT, type: WORKING_TIME_TYPE) {
    return await this.prisma.workingTime.findFirst({
      where: { lineId, shift, type },
    });
  }

  // findAllWorkingTimeByLineId() {
  //   return `This action returns all workingTime`;
  // }

  // findOne(id: number) {
  //   return `This action returns a #${id} workingTime`;
  // }

  // update(id: number, updateWorkingTimeDto: UpdateWorkingTimeDto) {
  //   return `This action updates a #${id} workingTime`;
  // }

  // remove(id: number) {
  //   return `This action removes a #${id} workingTime`;
  // }
}
