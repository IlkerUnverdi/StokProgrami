import { ReturnType } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsInt,
  IsOptional,
  IsPositive,
  IsString,
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
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  sourcePurchaseId?: number;

  @IsOptional()
  @IsString()
  note?: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateReturnItemDto)
  items!: CreateReturnItemDto[];
}
