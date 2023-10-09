import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import { UserService } from 'src/services/user.service';
import {
  CreateUserDTO,
  IndexUserDTO,
  UpdateUserDTO,
} from 'src/validators/user.validator';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  async register(@Req() req: Request, @Body() body: CreateUserDTO) {
    return await this.userService.register(req, body);
  }

  @Put('/:id')
  async update(
    @Req() req: Request,
    @Param() { id },
    @Body() body: UpdateUserDTO,
  ) {
    return await this.userService.update(req, id, body);
  }

  @Get()
  async index(
    @Req() req: Request,
    @Body()
    body: IndexUserDTO,
  ) {
    return await this.userService.index(req, body);
  }

  @Get('/:id')
  async show(
    @Req() req: Request,
    @Param('id', new ParseUUIDPipe()) id: string,
  ) {
    return await this.userService.show(req, id);
  }

  @Delete('/:id')
  async delete(
    @Req() req: Request,
    @Param('id', new ParseUUIDPipe()) id: string,
  ) {
    return await this.userService.delete(req, id);
  }
}
