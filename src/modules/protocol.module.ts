import { Module } from '@nestjs/common';
import { ProtocolController } from 'src/controllers/protocol.controller';
import { ProtocolService } from 'src/services/protocol.service';

@Module({
  controllers: [ProtocolController],
  providers: [ProtocolService],
  exports: [ProtocolService],
})
export class ProtocolModule {}
