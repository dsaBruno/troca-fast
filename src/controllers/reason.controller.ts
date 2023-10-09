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
import { ReasonService } from 'src/services/reason.service';
import {
  CreateReasonDTO,
  GetReasonDTO,
  IndexReasonDTO,
  UpdateReasonDTO,
} from 'src/validators/reason.validator';

@Controller('reason')
export class ReasonController {
  constructor(private readonly reasonService: ReasonService) {}
  @Post()
  async register(@Req() req, @Body() body: CreateReasonDTO[]) {
    return await this.reasonService.register(req, body);
  }

  @Put('/:id')
  async update(
    @Req() req,
    @Param('id') { id }: GetReasonDTO,
    @Body() body: UpdateReasonDTO,
  ) {
    return await this.reasonService.update(req, id, body);
  }

  @Get('/:id')
  async show(@Req() req, @Param() { id }: GetReasonDTO) {
    return await this.reasonService.show(req, id);
  }

  @Get()
  async index(@Req() req, @Body() body: IndexReasonDTO) {
    return await this.reasonService.index(req, body);
  }

  @Delete('/:id')
  async delete(@Req() req, @Param() { id }: GetReasonDTO) {
    return await this.reasonService.delete(req, id);
  }
}
