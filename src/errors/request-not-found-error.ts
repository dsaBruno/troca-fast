import { HttpException, HttpStatus } from '@nestjs/common';

export class RequestNotFound extends HttpException {
  constructor() {
    super('Request not found!', HttpStatus.NOT_FOUND);
  }
}
