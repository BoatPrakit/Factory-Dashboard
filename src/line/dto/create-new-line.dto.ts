import { IsNotEmpty, IsString } from 'class-validator';

export class CreateNewLineDto {
  @IsNotEmpty()
  @IsString()
  lineName: string;
}
