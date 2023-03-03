import { IsNotEmpty, IsNumber } from 'class-validator';

export class PaginationFilter {
  @IsNotEmpty()
  @IsNumber()
  page: number;

  @IsNotEmpty()
  @IsNumber()
  take: number;
}
