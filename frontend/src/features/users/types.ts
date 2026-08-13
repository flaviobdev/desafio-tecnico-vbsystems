export type PersonType = 'PF' | 'PJ';

export type SignupPayload = {
  personType: PersonType;
  name: string;
  tradingName?: string;
  email: string;
  phone: string;
  document: string;
  zipCode: string;
  address: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
};

export type SignupResponse = SignupPayload & {
  id: string;
  createdAt: string;
};
