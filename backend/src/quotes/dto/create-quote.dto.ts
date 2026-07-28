import { CreateQuoteItemDto } from './create-quote-item.dto';

export class CreateQuoteDto {
  currentAccountId?: number;
  note?: string;
  items!: CreateQuoteItemDto[];
}
