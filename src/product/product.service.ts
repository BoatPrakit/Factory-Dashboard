import { BadRequestException, Injectable } from '@nestjs/common';
import { Model, Product } from '@prisma/client';
import { AlertService } from 'src/alert/alert.service';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  getStartDateAndEndDate,
  getStartEndDateCurrentShift,
} from 'src/utils/date.utils';
import { CreateProductDto } from './dto/create-product.dto';
import { GetProductInputDto } from './dto/get-product-input.dto';
import { GetProductDto } from './dto/get-product.dto';
import { InputProductAmountDto } from './dto/input-product-amount.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductQuery } from './interface/product-query.interface';

@Injectable()
export class ProductService {
  constructor(
    private prisma: PrismaService,
    private alertService: AlertService,
  ) {}

  async create({ defect, employee, ...createProductDto }: CreateProductDto) {
    let product: Product;
    const model = await this.prisma.model.findUnique({
      where: { modelId: createProductDto.modelId },
    });
    if (!model) throw new BadRequestException('model not found');
    const existProduct = await this.prisma.product.findUnique({
      where: { serialNumber: createProductDto.serialNumber },
    });
    // if product exist but finish
    if (existProduct && existProduct?.isGoods)
      throw new BadRequestException(
        'there is conflict pin number please provide another pin number',
      );

    // checking defect or employee is empty
    if (defect) {
      if (!employee)
        throw new BadRequestException(
          'defect must has employee data who inserted',
        );
    } else if (employee) {
      if (!defect)
        throw new BadRequestException(
          "there is employee data but doesn't has defect",
        );
    }

    if (!defect && !employee) {
      if (existProduct) {
        // if exist product not finish and convert to goods
        product = await this.prisma.product.update({
          data: { isGoods: true },
          where: { productId: existProduct.productId },
        });
        return product;
      }
      // if product not exist and it's good
      product = await this.prisma.product.create({
        data: { isGoods: true, ...createProductDto },
      });
    } else {
      // if product not finish and have more failure or new defect product
      product = await this.createProductDefect(
        { defect, employee, ...createProductDto },
        model,
        existProduct,
      );
    }
    await this.alertService.alertWhenBelowCriteria(
      model.lineId,
      createProductDto.timestamp,
    );
    return product;
  }

  async createProductDefect(
    { defect, employee, ...createProductDto }: CreateProductDto,
    model: Model,
    existProduct?: Product,
  ) {
    const workingTime = await this.prisma.workingTime.findFirst({
      where: {
        lineId: model.lineId,
        shift: employee.shift,
        type: employee.workingTimeType,
      },
    });
    if (!workingTime) throw new BadRequestException('working time not found');
    const existEmployee = await this.prisma.employee.findUnique({
      where: { employeeId: employee.employeeId },
    });
    if (!existEmployee)
      throw new BadRequestException('employee data not found');
    const employeeShift = await this.prisma.employeeShift.findFirst({
      where: {
        employeeId: existEmployee.employeeId,
        group: employee.group,
        workingTimeId: workingTime.workingTimeId,
      },
    });
    const failureDetail = await this.prisma.failureDetail.findFirst({
      where: {
        failureDetailId: defect.failureDetailId,
        lineId: model.lineId,
      },
    });
    if (!failureDetail)
      throw new BadRequestException(
        'failure detail id is invalid, maybe it not exist in this fabricator line',
      );
    const station = await this.prisma.station.findFirst({
      where: { stationId: defect.stationId, lineId: model.lineId },
    });
    if (!station)
      throw new BadRequestException(
        'station id is invalid, maybe it not exist in this fabricator line',
      );

    const failure = await this.prisma.failure.create({
      data: {
        position: defect.position,
        failureDetail: {
          connect: { failureDetailId: defect.failureDetailId },
        },
        station: { connect: { stationId: defect.stationId } },
        employeeShift: {
          connectOrCreate: {
            create: {
              group: employee.group,
              employee: { connect: { employeeId: employee.employeeId } },
              workingTime: {
                connect: { workingTimeId: workingTime.workingTimeId },
              },
            },
            where: { employeeShiftId: employeeShift?.employeeShiftId || -1 },
          },
        },
      },
    });
    let product: Product = existProduct;
    if (!existProduct) {
      product = await this.prisma.product.create({
        data: { isGoods: false, ...createProductDto },
      });
    }
    await this.prisma.productHaveFailure.create({
      data: {
        failureId: failure.failureId,
        productId: existProduct ? existProduct.productId : product.productId,
        timestamp: createProductDto.timestamp,
      },
    });
    return product;
  }

  async getProductInput(payload: GetProductInputDto) {
    const timeShift = getStartEndDateCurrentShift(new Date(payload.date));
    return await this.prisma.productInputAmount.findFirst({
      where: {
        position: payload.position,
        date: { gte: timeShift.startDate, lte: timeShift.endDate },
      },
    });
  }

  async inputProductAmount(payload: InputProductAmountDto) {
    await this.checkStationPosition(payload);
    const timeShift = getStartEndDateCurrentShift(new Date(payload.date));
    const productInputRecord = await this.prisma.productInputAmount.findFirst({
      where: {
        stationId: payload.stationId,
        date: { gte: timeShift.startDate, lte: timeShift.endDate },
      },
    });
    let result;
    if (productInputRecord) {
      result = await this.prisma.productInputAmount.update({
        where: { productInputId: productInputRecord.productInputId },
        data: { amount: { increment: payload.increment } },
      });
    } else {
      result = await this.prisma.productInputAmount.create({
        data: {
          amount: payload.increment,
          position: payload.position,
          station: { connect: { stationId: payload.stationId } },
          date: payload.date,
        },
      });
    }
    return result;
  }

  private async checkStationPosition(payload: InputProductAmountDto) {
    const station = await this.prisma.station.findUnique({
      where: { stationId: payload.stationId },
    });
    if (!station) {
      throw new BadRequestException('this station id does not exist');
    }
    const stations = await this.prisma.station.findMany({
      where: { lineId: station.lineId },
      orderBy: { sequence: 'asc' },
    });
    if (!stations.length) throw new BadRequestException('no station available');
    if (payload.position === 'BOTTLE_NECK') {
      const stationBottleNeck = stations.sort((a, b) =>
        b.cycleTime.minus(a.cycleTime).toNumber(),
      )[0];
      if (stationBottleNeck.stationId !== station.stationId) {
        throw new BadRequestException('this station is not bottle neck');
      }
    } else {
      const firstStation = stations[0];
      if (firstStation.stationId !== station.stationId) {
        throw new BadRequestException('this station is not first station');
      }
    }
  }

  async findAll() {
    return await this.prisma.product.findMany();
  }

  async findOne(id: number) {
    return await this.prisma.product.findUnique({
      where: { productId: id },
    });
  }

  async findAllProductByFilter({
    lineId,
    pagination,
    endAt,
    startAt,
  }: GetProductDto) {
    const now = new Date().toISOString();
    const date = getStartDateAndEndDate(startAt || now, endAt);
    const productsWithOutFilter = await this.prisma.product.findMany({
      where: {
        timestamp: { gte: date.startDate, lte: date.endDate },
        model: { lineId },
      },
    });
    const products = await this.prisma.product.findMany({
      where: {
        timestamp: { gte: date.startDate, lte: date.endDate },
        model: { lineId },
      },
      include: {
        model: { include: { line: true } },
        productHaveFailure: {
          include: {
            failure: {
              include: {
                failureDetail: true,
                employeeShift: { include: { employee: true } },
              },
            },
          },
        },
      },
      skip: (pagination.page - 1) * pagination.take,
      take: pagination.take,
      orderBy: { timestamp: 'desc' },
    });
    const items = productsWithOutFilter.length;
    const responseProducts = products.map((p) => ({
      pinStampNumber: p.serialNumber,
      model: p.model.modelName,
      status: p.isGoods,
      defectType: p.productHaveFailure.length
        ? p.productHaveFailure[0].failure.failureDetail.type
        : '',
      operation: p.model.line.lineName,
      failureDetail: p.productHaveFailure.length
        ? p.productHaveFailure[0].failure.failureDetail.details
        : '',
      employee: p.productHaveFailure.length
        ? p.productHaveFailure[0].failure.employeeShift.employee.employeeName
        : '',
    }));
    return {
      products: responseProducts,
      pagination: {
        total: items,
        pageTotal: Math.ceil(items / pagination.take),
        take: pagination.take,
        page: pagination.page,
      },
    };
  }
}
