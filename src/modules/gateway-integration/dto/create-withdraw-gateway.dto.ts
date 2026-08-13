import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateWithdrawGatewayDto {
  @IsNumber()
  @Min(1)
  @IsNotEmpty()
  amount!: number;

  @IsString()
  @IsNotEmpty()
  pixKey!: string;

  @IsString()
  @IsNotEmpty()
  document!: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  externalReference?: string;
}
