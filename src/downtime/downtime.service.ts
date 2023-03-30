import { BadRequestException, Injectable } from '@nestjs/common';
import * as moment from 'moment';
import { AlertService } from 'src/alert/alert.service';
import { EmployeeService } from 'src/employee/employee.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { WorkingTimeService } from 'src/working-time/working-time.service';
import { CreateDowntimeDto } from './dto/create-downtime.dto';
import { CreatePaintDowntimeDto } from './dto/create-paint-downtime.dto';
import { UpdateDowntimeDto } from './dto/update-downtime.dto';

@Injectable()
export class DowntimeService {
  constructor(
    private prisma: PrismaService,
    private workingTimeService: WorkingTimeService,
    private alertService: AlertService,
  ) {}

  async create(createDowntimeDto: CreateDowntimeDto | CreatePaintDowntimeDto) {
    if (
      createDowntimeDto instanceof CreatePaintDowntimeDto &&
      !createDowntimeDto.extendedAvailabilityId
    ) {
      throw new BadRequestException('extendedAvailabilityId is not empty');
    }
    const start = moment(createDowntimeDto.startAt);
    const end = moment(createDowntimeDto.endAt);
    const station = await this.prisma.station.findUnique({
      where: { stationId: createDowntimeDto.stationId },
    });
    if (!station) throw new BadRequestException('station not exist');
    const duration = moment.duration(end.diff(start)).asMinutes();
    const workingTime = await this.workingTimeService.findOneByShift(
      station.lineId,
      createDowntimeDto.employee.shift,
      createDowntimeDto.employee.workingTimeType,
    );
    if (!workingTime) throw new BadRequestException('working time not found');
    const existEmployee = await this.prisma.employee.findUnique({
      where: { employeeId: createDowntimeDto.employee.employeeId },
    });
    if (!existEmployee)
      throw new BadRequestException('employee data not found');
    const availabilityLose = await this.prisma.availabilityLose.findFirst({
      where: {
        availabilityId: createDowntimeDto.availabilityId,
        lineId: station.lineId,
      },
    });
    const employeeShift = await this.prisma.employeeShift.findFirst({
      where: {
        employeeId: existEmployee.employeeId,
        group: createDowntimeDto.employee.group,
        workingTimeId: workingTime.workingTimeId,
      },
    });
    if (!availabilityLose)
      throw new BadRequestException(
        'availability id not found or this availability exist in another station',
      );

    const extendedCause = (createDowntimeDto as CreatePaintDowntimeDto)
      .extendedAvailabilityId
      ? {
          connect: {
            extendedAvailabilityId: (
              createDowntimeDto as CreatePaintDowntimeDto
            ).extendedAvailabilityId,
          },
        }
      : undefined;
    const downtime = await this.prisma.downtime.create({
      data: {
        duration: Number(duration.toFixed(2)),
        startAt: createDowntimeDto.startAt,
        endAt: createDowntimeDto.endAt,
        station: { connect: { stationId: createDowntimeDto.stationId } },
        availabilityLose: {
          connect: { availabilityId: availabilityLose.availabilityId },
        },
        extendedCause,
        employeeShift: {
          connectOrCreate: {
            create: {
              group: createDowntimeDto.employee.group,
              employee: {
                connect: { employeeId: createDowntimeDto.employee.employeeId },
              },
              workingTime: {
                connect: { workingTimeId: workingTime.workingTimeId },
              },
            },
            where: { employeeShiftId: employeeShift?.employeeShiftId || -1 },
          },
        },
      },
    });
    // await this.alertService.alertWhenBelowCriteria(
    //   station.lineId,
    //   createDowntimeDto.startAt,
    // );
    return downtime;
  }
}
