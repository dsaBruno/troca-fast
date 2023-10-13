import { Module } from '@nestjs/common';
import { RequestGateway } from 'src/gateways/request.gateway';

@Module({
  // providers: [RequestGateway],
  // exports: [RequestGatewayModule],
})
export class RequestGatewayModule {}
