import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateExtendedAvailabilityDto {
  @IsNotEmpty()
  @IsString()
  digit: string;
  @IsNotEmpty()
  @IsString()
  details: string;

  @IsNotEmpty()
  @IsNumber()
  lineId: number;
}
