import { FAILURE_DETAIL_TYPE } from '@prisma/client';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateExtendedFailureDto {
  @IsNotEmpty()
  @IsString()
  details: string;

  @IsNotEmpty()
  @IsString()
  defectTypeId: string;

  @IsNotEmpty()
  @IsNumber()
  lineId: number;
}
