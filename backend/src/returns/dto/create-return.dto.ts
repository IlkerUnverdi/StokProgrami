import { CreateReturnItemDto } from './create-return-item.dto';

export class CreateReturnDto {
  type!:
    | 'CUSTOMER_RETURN'
    | 'SUPPLIER_RETURN'
    | 'DEFECTIVE_RETURN'
    | 'WRONG_ITEM_RETURN';

  currentAccountId?: number;
  note?: string;
  items!: CreateReturnItemDto[];
}
