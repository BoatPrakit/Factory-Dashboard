import { Type } from 'class-transformer';
import {
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  ValidateNested,
} from 'class-validator';
import { PaginationFilter } from './pagination-filter.dto';

export class GetProductDto {
  @IsNotEmpty()
  @IsNumber()
  lineId: number;

  @IsOptional()
  @IsDateString()
  startAt?: string;

  @IsOptional()
  @IsDateString()
  endAt?: string;

  @IsNotEmpty()
  @Type(() => PaginationFilter)
  @ValidateNested({ each: true })
  pagination: PaginationFilter;
}
