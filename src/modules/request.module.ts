import { Module } from '@nestjs/common';
import { RequestController } from 'src/controllers/request.controller';
import { RequestService } from 'src/services/request.service';
import { RequestGatewayModule } from './request.gateway.module';

@Module({
  // imports: [RequestGatewayModule],
  controllers: [RequestController],
  providers: [RequestService],
  exports: [RequestService],
})
export class RequestModule {}
