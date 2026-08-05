import { ReturnType } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { CreateReturnItemDto } from './create-return-item.dto';

export class CreateReturnDto {
  @IsEnum(ReturnType)
  type!: ReturnType;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  currentAccountId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  sourceSaleId?: number;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  returnInvoiceNo?: string;

  @IsOptional()
  @IsDateString()
  returnInvoiceDate?: string;

  @IsOptional()
  @IsString()
  note?: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateReturnItemDto)
  items!: CreateReturnItemDto[];
}
