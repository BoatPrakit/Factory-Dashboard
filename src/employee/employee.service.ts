import { Injectable } from '@nestjs/common';
import { SHIFT, WORKING_TIME_TYPE } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';

@Injectable()
export class EmployeeService {
  constructor(private prisma: PrismaService) {}
  async create(createEmployeeDto: CreateEmployeeDto) {
    return await this.prisma.employee.create({
      data: { ...createEmployeeDto },
    });
  }

  async findAll() {
    return await this.prisma.employee.findMany();
  }

  async findOneByShift(lineId: number, shift: SHIFT, type: WORKING_TIME_TYPE) {
    return await this.prisma.workingTime.findFirst({
      where: { lineId, shift, type },
    });
  }

  update(id: number, updateEmployeeDto: UpdateEmployeeDto) {
    return `This action updates a #${id} employee`;
  }

  remove(id: number) {
    return `This action removes a #${id} employee`;
  }
}
