import { Module } from '@nestjs/common';
import { RequestController } from 'src/controllers/request.controller';
import { RequestService } from 'src/services/request.service';

@Module({
  controllers: [RequestController],
  providers: [RequestService],
  exports: [RequestService],
})
export class RequestModule {}
