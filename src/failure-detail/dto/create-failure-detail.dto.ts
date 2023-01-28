import { FAILURE_DETAIL_TYPE } from '@prisma/client';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateFailureDetailDto {
  @IsNotEmpty()
  @IsString()
  details: string;

  @IsNotEmpty()
  @IsEnum(FAILURE_DETAIL_TYPE)
  type: FAILURE_DETAIL_TYPE;

  @IsOptional()
  @IsString()
  abbreviation: string;

  @IsNotEmpty()
  @IsNumber()
  lineId: number;
}
