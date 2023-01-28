import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateStationDto {
  @IsNotEmpty()
  @IsString()
  stationId: string;

  @IsNotEmpty()
  @IsString()
  stationName: string;

  @IsNotEmpty()
  @IsNumber()
  cycleTime: number;

  @IsNotEmpty()
  @IsNumber()
  lineId: number;
}
