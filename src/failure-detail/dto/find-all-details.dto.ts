import { FAILURE_DETAIL_TYPE } from '@prisma/client';
import { IsEnum, IsNotEmpty } from 'class-validator';

export class FindAllDetailsDto {
  @IsNotEmpty()
  @IsEnum(FAILURE_DETAIL_TYPE)
  type: FAILURE_DETAIL_TYPE;
}
