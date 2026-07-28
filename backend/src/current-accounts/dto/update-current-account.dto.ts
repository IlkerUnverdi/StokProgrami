export class UpdateCurrentAccountDto {
  name?: string;
  phone?: string;
  taxNumber?: string;
  address?: string;
  type?: 'CUSTOMER' | 'SUPPLIER';
  isActive?: boolean;
}
