import { EMPLOYEE_SHIFT_GROUP, SHIFT, WORKING_TIME_TYPE } from '@prisma/client';
import { IsBoolean, IsEnum, IsNotEmpty, IsString } from 'class-validator';

export class EmployeeDto {
  @IsNotEmpty()
  @IsString()
  employeeId: string;

  @IsNotEmpty()
  @IsEnum(SHIFT)
  shift: SHIFT;

  @IsNotEmpty()
  @IsEnum(WORKING_TIME_TYPE)
  workingTimeType: WORKING_TIME_TYPE;

  @IsNotEmpty()
  @IsEnum(EMPLOYEE_SHIFT_GROUP)
  group: EMPLOYEE_SHIFT_GROUP;
}
