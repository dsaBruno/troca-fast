import { Module } from '@nestjs/common';
import { StatusController } from 'src/controllers/status.controller';
import { StatusService } from 'src/services/status.service';

@Module({
  controllers: [StatusController],
  providers: [StatusService],
  exports: [StatusService],
})
export class StatusModule {}
