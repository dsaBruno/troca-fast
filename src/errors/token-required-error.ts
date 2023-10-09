import { HttpException, HttpStatus } from '@nestjs/common';

export class TokenRequiredError extends HttpException {
  constructor() {
    super(
      'This request is private and requires a token',
      HttpStatus.UNAUTHORIZED,
    );
  }
}
