import { HttpException, HttpStatus } from '@nestjs/common';

export class ReasonNotFound extends HttpException {
  constructor() {
    super('Reason not found!', HttpStatus.NOT_FOUND);
  }
}
