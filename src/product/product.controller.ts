import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { GetProductDto } from './dto/get-product.dto';
import { InputProductAmountDto } from './dto/input-product-amount.dto';
import { GetProductInputDto } from './dto/get-product-input.dto';

@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post()
  async create(@Body() createProductDto: CreateProductDto) {
    const product = await this.productService.create(createProductDto);
    return product;
  }

  @Post('all/filter')
  async findAllProductByFilter(@Body() payload: GetProductDto) {
    return await this.productService.findAllProductByFilter(payload);
  }

  @Post('input-amount')
  async inputProductAmount(@Body() payload: InputProductAmountDto) {
    return await this.productService.inputProductAmount(payload);
  }

  @Post('get/input-amount')
  async getProductInput(@Body() payload: GetProductInputDto) {
    return await this.productService.getProductInput(payload);
  }

  @Get()
  findAll() {
    return this.productService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productService.findOne(+id);
  }
}
