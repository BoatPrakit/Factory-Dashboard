import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateAvailabilityLoseDto } from './dto/create-availability-lose.dto';
import { CreateExtendedAvailabilityDto } from './dto/create-extended-availability.dto';

@Injectable()
export class AvailabilityLoseService {
  constructor(private prisma: PrismaService) {}

  async create(createAvailabilityLoseDto: CreateAvailabilityLoseDto) {
    return await this.prisma.availabilityLose.create({
      data: { ...createAvailabilityLoseDto },
    });
  }

  async createExtendedAvailability(payload: CreateExtendedAvailabilityDto) {
    return await this.prisma.extendedCauseAvailability.create({
      data: { ...payload },
    });
  }

  async findManyExtendedAvailability(lineId: number) {
    return await this.prisma.extendedCauseAvailability.findMany({
      where: { lineId },
    });
  }

  async findManyByLineId(lineId: number) {
    return await this.prisma.availabilityLose.findMany({ where: { lineId } });
  }
}
