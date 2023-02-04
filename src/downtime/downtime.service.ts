import { BadRequestException, Injectable } from '@nestjs/common';
import * as moment from 'moment';
import { EmployeeService } from 'src/employee/employee.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { WorkingTimeService } from 'src/working-time/working-time.service';
import { CreateDowntimeDto } from './dto/create-downtime.dto';
import { UpdateDowntimeDto } from './dto/update-downtime.dto';

@Injectable()
export class DowntimeService {
  constructor(
    private prisma: PrismaService,
    private workingTimeService: WorkingTimeService,
  ) {}

  async create({ employee, ...createDowntimeDto }: CreateDowntimeDto) {
    const start = moment(createDowntimeDto.startAt);
    const end = moment(createDowntimeDto.endAt);
    const station = await this.prisma.station.findUnique({
      where: { stationId: createDowntimeDto.stationId },
    });
    const duration = moment.duration(end.diff(start)).asMinutes();
    const workingTime = await this.workingTimeService.findOneByShift(
      station.lineId,
      employee.shift,
      employee.workingTimeType,
    );
    if (!workingTime) throw new BadRequestException('working time not found');
    const availabilityLose = await this.prisma.availabilityLose.findUnique({
      where: { availabilityId: createDowntimeDto.availabilityId },
    });
    if (!availabilityLose)
      throw new BadRequestException('availability not found');
    return this.prisma.downtime.create({
      data: {
        duration: Math.floor(duration),
        timestamp: createDowntimeDto.startAt,
        station: { connect: { stationId: createDowntimeDto.stationId } },
        availabilityLose: {
          connect: { availabilityId: availabilityLose.availabilityId },
        },
        employeeShift: {
          create: {
            group: employee.group,
            employee: { connect: { employeeId: employee.employeeId } },
            workingTime: {
              connect: { workingTimeId: workingTime.workingTimeId },
            },
          },
        },
      },
    });
  }
}
