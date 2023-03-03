import { BadRequestException, Injectable } from '@nestjs/common';
import * as moment from 'moment';
import { AlertService } from 'src/alert/alert.service';
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
    private alertService: AlertService,
  ) {}

  async create({ employee, ...createDowntimeDto }: CreateDowntimeDto) {
    const start = moment(createDowntimeDto.startAt);
    const end = moment(createDowntimeDto.endAt);
    const station = await this.prisma.station.findUnique({
      where: { stationId: createDowntimeDto.stationId },
    });
    if (!station) throw new BadRequestException('station not exist');
    const duration = moment.duration(end.diff(start)).asMinutes();
    const workingTime = await this.workingTimeService.findOneByShift(
      station.lineId,
      employee.shift,
      employee.workingTimeType,
    );
    if (!workingTime) throw new BadRequestException('working time not found');
    const availabilityLose = await this.prisma.availabilityLose.findFirst({
      where: {
        availabilityId: createDowntimeDto.availabilityId,
        lineId: station.lineId,
      },
    });
    if (!availabilityLose)
      throw new BadRequestException(
        'availability id not found or this availability exist in another station',
      );
    const downtime = await this.prisma.downtime.create({
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
    await this.alertService.alertWhenBelowCriteria(
      station.lineId,
      createDowntimeDto.startAt,
    );
    return downtime;
  }
}
