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
import { StatusService } from 'src/services/status.service';
import { CreateStatusDTO, GetStatusDTO } from 'src/validators/status.validator';

@Controller('status')
export class StatusController {
  constructor(private readonly statusService: StatusService) {}
  @Post()
  async register(@Req() req, @Body() body: CreateStatusDTO[]) {
    return await this.statusService.register(req, body);
  }

  @Put('/:id')
  async update(@Req() req, @Param() { id }: GetStatusDTO, @Body() body) {
    return await this.statusService.update(req, id, body);
  }

  @Get('/:id')
  async show(@Req() req, @Param() { id }: GetStatusDTO) {
    return await this.statusService.show(req, id);
  }

  @Get()
  async listAll(@Req() req) {
    return await this.statusService.listAll(req);
  }

  @Post('/list')
  async index(@Req() req, @Body() body) {
    return await this.statusService.index(req, body);
  }

  @Delete('/:id')
  async delete(@Req() req, @Param() { id }: GetStatusDTO) {
    return await this.statusService.delete(req, id);
  }
}
