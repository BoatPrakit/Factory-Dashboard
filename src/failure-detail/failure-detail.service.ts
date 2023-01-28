import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateFailureDetailDto } from './dto/create-failure-detail.dto';
import { FindAllDetailsDto } from './dto/find-all-details.dto';
// import { UpdateFailureDetailDto } from './dto/update-failure-detail.dto';

@Injectable()
export class FailureDetailService {
  constructor(private prisma: PrismaService) {}
  async create(createFailureDetailDto: CreateFailureDetailDto) {
    return await this.prisma.failureDetail.create({
      data: { ...createFailureDetailDto },
    });
  }

  async findAllFailureDetailByLineId(
    lineId: number,
    filter: FindAllDetailsDto,
  ) {
    return await this.prisma.failureDetail.findMany({
      where: { lineId: lineId, type: filter.type },
    });
  }

  // findOne(id: number) {
  //   return `This action returns a #${id} failureDetail`;
  // }

  // update(id: number, updateFailureDetailDto: UpdateFailureDetailDto) {
  //   return `This action updates a #${id} failureDetail`;
  // }

  // remove(id: number) {
  //   return `This action removes a #${id} failureDetail`;
  // }
}
