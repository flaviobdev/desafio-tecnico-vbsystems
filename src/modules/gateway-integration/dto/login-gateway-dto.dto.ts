import { IsNotEmpty, IsString } from 'class-validator';

export class LoginGatewayDto {
  @IsString()
  @IsNotEmpty()
  document!: string;

  @IsString()
  @IsNotEmpty()
  password!: string;
}
