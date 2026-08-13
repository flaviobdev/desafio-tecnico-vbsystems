import {
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class CardGatewayPaymentsDto {
  @IsNumber()
  @Min(1)
  @IsNotEmpty()
  amount!: number;

  @IsString()
  @IsOptional()
  description!: string;

  @IsString()
  @IsOptional()
  externalReference!: string;

  @IsString()
  @IsNotEmpty()
  cardNumber!: string;

  @IsString()
  @IsNotEmpty()
  cardHolder!: string;

  @IsString()
  @IsNotEmpty()
  expiryMonth!: string;

  @IsString()
  @IsNotEmpty()
  expiryYear!: string;

  @IsString()
  @IsNotEmpty()
  cvv!: string;

  @IsInt()
  @Min(1)
  @Max(21)
  installments!: number;

  @IsNumber()
  @Min(0)
  feePercent!: number;
}
