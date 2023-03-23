import { Type } from 'class-transformer';
import {
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsString,
  ValidateNested,
} from 'class-validator';
import { EmployeeDto } from 'src/product/dto/employee.dto';
import { CreateDowntimeDto } from './create-downtime.dto';

export class CreatePaintDowntimeDto extends CreateDowntimeDto {
  @IsNotEmpty()
  @IsNumber()
  extendedAvailabilityId: number;
}
