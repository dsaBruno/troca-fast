import { HttpException, HttpStatus } from '@nestjs/common';

export class InvalidEmailOrPassword extends HttpException {
  constructor() {
    super('Invalid e-mail or password!', HttpStatus.UNAUTHORIZED);
  }
}
