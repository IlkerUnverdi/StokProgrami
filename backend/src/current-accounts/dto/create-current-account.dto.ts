export class CreateCurrentAccountDto {
  name!: string;
  phone?: string;
  taxNumber?: string;
  address?: string;
  type!: 'CUSTOMER' | 'SUPPLIER';
}
