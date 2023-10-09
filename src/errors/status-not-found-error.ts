import { HttpException, HttpStatus } from '@nestjs/common';

export class StatusNotFound extends HttpException {
  constructor() {
    super('Status not found!', HttpStatus.NOT_FOUND);
  }
}
