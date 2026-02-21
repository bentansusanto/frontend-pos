export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  loyalPoints: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCustomerDto {
  name: string;
  email: string;
  phone?: string;
  address: string;
  city: string;
  country: string;
}

export interface UpdateCustomerDto extends Partial<CreateCustomerDto> {}
