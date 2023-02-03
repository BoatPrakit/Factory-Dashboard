import { Type } from 'class-transformer';
import {
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsString,
  ValidateNested,
} from 'class-validator';
import { EmployeeDto } from 'src/product/dto/employee.dto';

export class CreateDowntimeDto {
  @IsNotEmpty()
  @IsDateString()
  startAt: string;

  @IsNotEmpty()
  @IsDateString()
  endAt: string;

  @IsNotEmpty()
  @IsString()
  stationId: string;

  @IsNotEmpty()
  @IsString()
  availabilityId: string;

  @IsNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => EmployeeDto)
  employee: EmployeeDto;
}
