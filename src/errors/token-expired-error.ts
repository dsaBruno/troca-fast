import { HttpException, HttpStatus } from '@nestjs/common';

export class TokenExpiredError extends HttpException {
  constructor() {
    super('Your session has expired!', HttpStatus.UNAUTHORIZED);
  }
}
