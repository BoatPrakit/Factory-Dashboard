import { BadRequestException, Injectable } from '@nestjs/common';
import { Model, Product } from '@prisma/client';
import { AlertService } from 'src/alert/alert.service';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  getStartDateAndEndDate,
  getStartEndDateCurrentShift,
} from 'src/utils/date.utils';
import { CreateProductDto } from './dto/create-product.dto';
import { DeleteProductDto } from './dto/delete-product.dto';
import { GetProductInputDto } from './dto/get-product-input.dto';
import { GetProductDto } from './dto/get-product.dto';
import { InputProductAmountDto } from './dto/input-product-amount.dto';
import { UpdateProductPaintDto } from './dto/update-product-paint.dto';
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
    // await this.alertService.alertWhenBelowCriteria(
    //   model.lineId,
    //   createProductDto.timestamp,
    // );
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

  async updateProductOfPaint({
    defect,
    employee,
    ...payload
  }: UpdateProductPaintDto) {
    const existProduct = await this.prisma.product.findFirst({
      where: { serialNumber: payload.serialNumber },
    });
    if (!existProduct) {
      throw new BadRequestException('pin stamp number not found');
    }
    if (!existProduct.isGoods)
      throw new BadRequestException('this product not finish from fabricator');

    if (existProduct.isPaintFinish) {
      throw new BadRequestException('this product has been finished');
    }

    if (!defect) {
      // if paint finish good
      const product = await this.prisma.product.update({
        where: { serialNumber: payload.serialNumber },
        data: {
          isPaintFinish: true,
          paintLine: {
            connect: { lineId: payload.lineId },
          },
          paintAt: payload.paintAt,
        },
      });
      // await this.alertService.alertWhenBelowCriteria(
      //   payload.lineId,
      //   payload.paintAt,
      // );
      return product;
    }
    if (!employee) throw new BadRequestException('need employee information');

    const workingTime = await this.prisma.workingTime.findFirst({
      where: {
        lineId: payload.lineId,
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
        lineId: payload.lineId,
      },
    });
    if (!failureDetail)
      throw new BadRequestException(
        'failure detail id is invalid, maybe it not exist in this fabricator line',
      );
    const station = await this.prisma.station.findFirst({
      where: { stationId: defect.stationId, lineId: payload.lineId },
    });
    if (!station)
      throw new BadRequestException(
        'station id is invalid, maybe it not exist in this fabricator line',
      );
    const failure = await this.prisma.failure.create({
      data: {
        extendedFailureDetail: {
          connect: { extendedFailureId: defect.defectTypeId },
        },
        failureDetail: {
          connect: { failureDetailId: defect.failureDetailId },
        },
        station: {
          connect: { stationId: defect.stationId },
        },
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
    const paintProduct = await this.prisma.product.update({
      data: {
        isPaintFinish: false,
        paintAt: payload.paintAt,
        paintLine: { connect: { lineId: payload.lineId } },
      },
      where: { serialNumber: payload.serialNumber },
    });

    await this.prisma.productHaveFailure.create({
      data: {
        failure: { connect: { failureId: failure.failureId } },
        product: { connect: { productId: paintProduct.productId } },
        timestamp: payload.paintAt,
      },
    });
    // await this.alertService.alertWhenBelowCriteria(
    //   payload.lineId,
    //   payload.paintAt,
    // );
    return paintProduct;
  }

  async getProductInput(lineId: number, payload: GetProductInputDto) {
    const timeShift = getStartEndDateCurrentShift(
      new Date(payload.date),
      false,
    );
    return await this.prisma.productInputAmount.findFirst({
      where: {
        position: payload.position,
        station: { lineId },
        date: { gte: timeShift.startDate, lte: timeShift.endDate },
      },
    });
  }

  async inputProductAmount(payload: InputProductAmountDto) {
    await this.checkStationPosition(payload);
    const timeShift = getStartEndDateCurrentShift(
      new Date(payload.date),
      false,
    );
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
    const line = await this.prisma.line.findUnique({
      where: { lineId },
    });
    if (!line) {
      throw new BadRequestException('line id not exist');
    }

    const isPaint = line.lineName.toLowerCase().includes('paint');
    const productsWithOutFilter = await this.prisma.product.findMany({
      where: {
        paintAt: isPaint ? { gte: startAt, lte: endAt } : undefined,
        timestamp: !isPaint ? { gte: startAt, lte: endAt } : undefined,
        paintLineId: isPaint ? lineId : undefined,
        model: !isPaint ? { lineId } : undefined,
      },
    });

    const products = await this.prisma.product.findMany({
      where: {
        paintAt: isPaint ? { gte: startAt, lte: endAt } : undefined,
        timestamp: !isPaint ? { gte: startAt, lte: endAt } : undefined,
        paintLineId: isPaint ? lineId : undefined,
        model: !isPaint ? { lineId } : undefined,
      },
      include: {
        model: { include: { line: true } },
        productHaveFailure: {
          include: {
            failure: {
              include: {
                failureDetail: true,
                extendedFailureDetail: true,
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
      status: isPaint ? p.isPaintFinish : p.isGoods,
      defectType: p.productHaveFailure.length
        ? p.productHaveFailure[0].failure.failureDetail.type
        : '',
      operation: p.model.line.lineName,
      failureDetail: p.productHaveFailure.length
        ? p.productHaveFailure[0].failure.failureDetail.details
        : '',
      extendedFailureDetail: p.productHaveFailure.length
        ? p.productHaveFailure[0].failure.extendedFailureDetail?.details
        : '',
      employee: p.productHaveFailure.length
        ? p.productHaveFailure[0].failure.employeeShift.employee.employeeName
        : '',
      timeStamp: isPaint ? p.paintAt : p.timestamp,
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

  async deleteProductsBetween(payload: DeleteProductDto) {
    const date = getStartDateAndEndDate(payload.startAt, payload.endAt);
    const timeStampCondition = { gte: date.startDate, lte: date.endDate };
    const productHaveFailure = await this.prisma.productHaveFailure.deleteMany({
      where: { timestamp: timeStampCondition },
    });
    const productionPlan = await this.prisma.productionPlan.deleteMany({
      where: { timestamp: timeStampCondition },
    });
    const product = await this.prisma.product.deleteMany({
      where: { timestamp: timeStampCondition },
    });
    const downtime = await this.prisma.downtime.deleteMany({
      where: { startAt: timeStampCondition },
    });
    return {
      date,
      productHaveFailure: productHaveFailure.count,
      productionPlan: productionPlan.count,
      product: product.count,
      downtime: downtime.count,
    };
  }
}
