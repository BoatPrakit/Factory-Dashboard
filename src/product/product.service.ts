import { BadRequestException, Injectable } from '@nestjs/common';
import { Model, Product } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductQuery } from './interface/product-query.interface';

@Injectable()
export class ProductService {
  constructor(private prisma: PrismaService) {}

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
    const employeeShift = await this.prisma.employeeShift.findFirst({
      where: {
        employeeId: employee.employeeId,
        group: employee.group,
        workingTimeId: workingTime.workingTimeId,
      },
    });
    if (!existEmployee)
      throw new BadRequestException('employee data not found');
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
            where: { employeeShiftId: employeeShift.employeeShiftId },
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

  async findAll() {
    return await this.prisma.product.findMany();
  }

  async findAllProductBetween(query: ProductQuery, start: Date, end: Date) {
    return await this.prisma.product.findMany({
      where: {
        timestamp: { gte: start, lte: end },
        isGoods: query.isGoods,
        model: { lineId: query.lineId },
      },
    });
  }

  async findOne(id: number) {
    return await this.prisma.product.findUnique({
      where: { productId: id },
    });
  }
}
