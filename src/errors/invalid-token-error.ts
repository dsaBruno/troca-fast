import { HttpException, HttpStatus } from '@nestjs/common';

export class InvalidTokenError extends HttpException {
  constructor() {
    super('Token provided is invalid', HttpStatus.UNAUTHORIZED);
  }
}
