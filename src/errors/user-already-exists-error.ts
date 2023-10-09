import { HttpException, HttpStatus } from '@nestjs/common';

export class UserAlreadyExist extends HttpException {
  constructor() {
    super('Email already exists!', HttpStatus.BAD_REQUEST);
  }
}
