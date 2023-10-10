import { HttpException, HttpStatus } from '@nestjs/common';

export class ProtocolNotFound extends HttpException {
  constructor() {
    super('Protocol not found!', HttpStatus.NOT_FOUND);
  }
}
