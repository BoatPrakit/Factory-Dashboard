import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateStationDto } from './dto/create-station.dto';
import { UpdateStationDto } from './dto/update-station.dto';

@Injectable()
export class StationService {
  constructor(private prisma: PrismaService) {}
  async create(createStationDto: CreateStationDto) {
    return await this.prisma.station.create({
      data: { ...createStationDto },
    });
  }

  async findAllStationByLineId(lineId: number) {
    return await this.prisma.station.findMany({ where: { lineId } });
  }
}
