import { Body, Controller, Get, Param, Post, Req } from '@nestjs/common';
import { Request } from 'express';
import { Public } from 'src/modules/decorators/auth.decorator';
import { AuthService } from 'src/services/auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('/login')
  async login(@Req() req: Request, @Body() { email, password }) {
    return await this.authService.login(email, password);
  }

  @Public()
  @Get('/forgot-password/:email')
  async forgotPassword(@Req() req: Request, @Param() { email }) {
    return await this.authService.forgotPassword(email);
  }
}
