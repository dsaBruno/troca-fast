import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import { ProtocolService } from 'src/services/protocol.service';
import {
  AddProductProtocolDTO,
  ChangeValuesProtocolDTO,
  GetProtocolDTO,
  IndexProtocolDTO,
} from 'src/validators/protocol.validator';

@Controller('protocol')
export class ProtocolController {
  constructor(private readonly protocolService: ProtocolService) {}
  @Put('/:id/add-product')
  async addProduct(@Req() req: Request, @Body() body: AddProductProtocolDTO[]) {
    return;
  }

  @Put('/:id/change-values')
  async changeValues(
    @Req() req: Request,
    @Body() body: ChangeValuesProtocolDTO,
  ) {
    return;
  }

  @Put('/:id/approve')
  async approve(@Req() req: Request, @Param() { id }: GetProtocolDTO) {
    return await this.protocolService.approve(req, id);
  }

  @Get('/:id/finish')
  async finish(@Req() req: Request, @Param() { id }: GetProtocolDTO) {
    return;
  }

  @Get('/:id')
  async show(@Req() req: Request, @Param() { id }: GetProtocolDTO) {
    return await this.protocolService.show(req, id);
  }

  @Post('/list')
  async index(@Req() req: Request, @Body() body: IndexProtocolDTO) {
    return await this.protocolService.index(req, body);
  }

  @Delete('/:id')
  async delete(@Req() req: Request, @Param() { id }: GetProtocolDTO) {
    return;
  }
}
