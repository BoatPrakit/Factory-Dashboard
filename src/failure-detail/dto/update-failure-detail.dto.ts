import { PartialType } from '@nestjs/mapped-types';
import { CreateFailureDetailDto } from './create-failure-detail.dto';

export class UpdateFailureDetailDto extends PartialType(
  CreateFailureDetailDto,
) {}
