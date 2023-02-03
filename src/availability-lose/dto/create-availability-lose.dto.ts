import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateAvailabilityLoseDto {
  @IsNotEmpty()
  @IsString()
  details: string;

  @IsNotEmpty()
  @IsString()
  availabilityId: string;

  @IsNotEmpty()
  @IsNumber()
  lineId: number;
}
