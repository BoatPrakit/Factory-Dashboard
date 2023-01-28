import { Type } from 'class-transformer';
import {
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Validate,
  ValidateNested,
} from 'class-validator';
import { DefectDto } from './defect.dto';
import { EmployeeDto } from './employee.dto';

export class CreateProductDto {
  @IsNotEmpty()
  @IsNumber()
  modelId: number;

  @IsNotEmpty()
  @IsString()
  serialNumber: string;

  @IsNotEmpty()
  @IsDateString()
  timestamp: string;

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => DefectDto)
  defect?: DefectDto;

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => EmployeeDto)
  employee?: EmployeeDto;
}
