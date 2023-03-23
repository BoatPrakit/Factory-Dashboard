import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class PaintDefect {
  @IsNotEmpty()
  @IsString()
  defectTypeId: string;

  @IsNotEmpty()
  @IsNumber()
  failureDetailId: number;

  @IsNotEmpty()
  @IsString()
  stationId: string;
}
