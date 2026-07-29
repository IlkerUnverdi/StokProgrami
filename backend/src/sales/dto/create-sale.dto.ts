import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsInt,
  IsNumber,
  IsObject,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';

export class CreateSaleItemDto {
  @IsInt()
  @IsPositive()
  productId: number;

  @IsInt()
  @IsPositive()
  quantity: number;

  @IsNumber({
    maxDecimalPlaces: 2,
  })
  @Min(0)
  unitPrice: number;
}

export class SalePaymentsDto {
  @IsOptional()
  @IsNumber({
    maxDecimalPlaces: 2,
  })
  @Min(0)
  CASH?: number;

  @IsOptional()
  @IsNumber({
    maxDecimalPlaces: 2,
  })
  @Min(0)
  CARD?: number;

  @IsOptional()
  @IsNumber({
    maxDecimalPlaces: 2,
  })
  @Min(0)
  TRANSFER?: number;

  @IsOptional()
  @IsNumber({
    maxDecimalPlaces: 2,
  })
  @Min(0)
  ON_ACCOUNT?: number;
}

export class CreateSaleDto {
  @IsArray()
  @ArrayMinSize(1, {
    message: 'Satışta en az bir ürün bulunmalıdır.',
  })
  @ValidateNested({ each: true })
  @Type(() => CreateSaleItemDto)
  items: CreateSaleItemDto[];

  @IsObject()
  @ValidateNested()
  @Type(() => SalePaymentsDto)
  payments: SalePaymentsDto;

  @IsOptional()
  @IsInt()
  @IsPositive()
  currentAccountId?: number;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string;
}