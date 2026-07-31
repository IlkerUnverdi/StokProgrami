import { Type } from 'class-transformer';
import {
  IsIn,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';

export class CreatePaymentDto {
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  amount!: number;

  @IsIn(['CASH', 'CARD', 'TRANSFER'])
  paymentMethod!: 'CASH' | 'CARD' | 'TRANSFER';

  @IsOptional()
  @IsString()
  note?: string;
}
