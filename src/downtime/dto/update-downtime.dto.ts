import { PartialType } from '@nestjs/mapped-types';
import { CreateDowntimeDto } from './create-downtime.dto';

export class UpdateDowntimeDto extends PartialType(CreateDowntimeDto) {}
