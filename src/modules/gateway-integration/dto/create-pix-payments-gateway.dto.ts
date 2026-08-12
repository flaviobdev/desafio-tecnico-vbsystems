import { IsNotEmpty, IsNumber, IsOptional, IsString, Min } from "class-validator";

export class PixGatewayPaymentsDto {

    @IsNumber()
    @Min(1)
    @IsNotEmpty()
    amount!: number;

    @IsString()
    @IsOptional()
    description!: string;

    @IsString()
    @IsNotEmpty()
    payerDocument!: string;

    @IsString()
    @IsOptional()
    externalReference!: string;
}