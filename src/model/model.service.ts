import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateModelDto } from './dto/create-model.dto';
import { UpdateModelDto } from './dto/update-model.dto';

@Injectable()
export class ModelService {
  constructor(private prisma: PrismaService) {}

  create(createModelDto: CreateModelDto) {
    return this.prisma.model.create({
      data: { ...createModelDto },
    });
  }

  async findAllModelByLineId(lineId: number) {
    return await this.prisma.model.findMany({
      where: { lineId: lineId },
    });
  }
  // findAll() {
  //   return `This action returns all model`;
  // }

  // findOne(id: number) {
  //   return `This action returns a #${id} model`;
  // }

  // update(id: number, updateModelDto: UpdateModelDto) {
  //   return `This action updates a #${id} model`;
  // }

  // remove(id: number) {
  //   return `This action removes a #${id} model`;
  // }
}
