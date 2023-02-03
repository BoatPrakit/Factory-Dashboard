import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateAvailabilityLoseDto } from './dto/create-availability-lose.dto';

@Injectable()
export class AvailabilityLoseService {
  constructor(private prisma: PrismaService) {}

  async create(createAvailabilityLoseDto: CreateAvailabilityLoseDto) {
    return await this.prisma.availabilityLose.create({
      data: { ...createAvailabilityLoseDto },
    });
  }

  async findManyByLineId(lineId: number) {
    return await this.prisma.availabilityLose.findMany({ where: { lineId } });
  }
}
