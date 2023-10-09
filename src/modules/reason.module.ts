import { Module } from '@nestjs/common';
import { ReasonController } from 'src/controllers/reason.controller';
import { ReasonService } from 'src/services/reason.service';

@Module({
  controllers: [ReasonController],
  providers: [ReasonService],
  exports: [ReasonService],
})
export class ReasonModule {}
