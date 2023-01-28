import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class DefectDto {
  @IsNotEmpty()
  @IsString()
  stationId: string;

  @IsNotEmpty()
  @IsNumber()
  failureDetailId: number;

  @IsOptional()
  @IsString()
  position: string;
}
