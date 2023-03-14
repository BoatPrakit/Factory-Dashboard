import { PRODUCT_INPUT_POSITION } from '@prisma/client';
import { IsDateString, IsEnum, IsNotEmpty } from 'class-validator';

export class GetProductInputDto {
  @IsNotEmpty()
  @IsDateString()
  date: string;

  @IsNotEmpty()
  @IsEnum(PRODUCT_INPUT_POSITION)
  position: PRODUCT_INPUT_POSITION;
}
