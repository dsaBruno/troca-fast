import { Module } from '@nestjs/common';
import { ReasonController } from 'src/controllers/reason.controller';
import { ReasonService } from 'src/services/reason.service';
import { RequestGatewayModule } from './request.gateway.module';

@Module({
  imports: [RequestGatewayModule],
  controllers: [ReasonController],
  providers: [ReasonService],
  exports: [ReasonService],
})
export class ReasonModule {}
