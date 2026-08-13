import { ApiProperty } from '@nestjs/swagger';
import { PaginatedResponseDto } from '../../../common/dto/paginated-response.dto';
import { WebhookEvent } from '../../gateway-integration/dto/create-webhook-gateway.dto';

export class WebhookResponseDto {
  @ApiProperty({ description: 'Id do webhook no gateway Lera Box' })
  id!: string;

  @ApiProperty({ enum: WebhookEvent })
  event!: WebhookEvent;

  @ApiProperty({ example: 'https://seu-sistema.com/api/webhooks/callback/pix' })
  url!: string;

  @ApiProperty()
  active!: boolean;

  @ApiProperty()
  createdAt!: string;
}

export class WebhooksPageDto extends PaginatedResponseDto {
  @ApiProperty({ type: [WebhookResponseDto] })
  data!: WebhookResponseDto[];
}
