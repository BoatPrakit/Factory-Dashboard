import { PRODUCT_INPUT_POSITION } from '@prisma/client';
import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsString,
} from 'class-validator';

export class InputProductAmountDto {
  @IsNotEmpty()
  @IsString()
  stationId: string;

  @IsNotEmpty()
  @IsDateString()
  date: string;

  @IsNotEmpty()
  @IsNumber()
  increment: number;

  @IsNotEmpty()
  @IsEnum(PRODUCT_INPUT_POSITION)
  position: PRODUCT_INPUT_POSITION;
}
