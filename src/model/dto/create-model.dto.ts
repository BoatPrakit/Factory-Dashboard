import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateModelDto {
  @IsNotEmpty()
  @IsString()
  modelName: string;
  @IsNotEmpty()
  @IsNumber()
  lineId: number;
}
