import { Injectable } from '@nestjs/common';
import { Line } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateNewLineDto } from './dto/create-new-line.dto';

@Injectable()
export class LineService {
  constructor(private prisma: PrismaService) {}

  async findAllLine(): Promise<Line[]> {
    return await this.prisma.line.findMany();
  }

  async findLineById(id: number): Promise<Line | null> {
    return await this.prisma.line.findUnique({
      where: { lineId: id },
    });
  }

  async createNewLine(newLineDto: CreateNewLineDto) {
    return await this.prisma.line.create({
      data: { lineName: newLineDto.lineName },
    });
  }
}
