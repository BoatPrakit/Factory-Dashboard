import { IsDateString, IsNotEmpty, IsString } from 'class-validator';

export class DeleteProductDto {
  @IsNotEmpty()
  @IsDateString()
  startAt: string;

  @IsNotEmpty()
  @IsDateString()
  endAt: string;
}
