import { Injectable } from '@nestjs/common';
import {
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  registerDecorator,
} from 'class-validator';
import { RequestNotFound } from 'src/errors/request-not-found-error';
import { prisma } from 'src/prisma/prisma.service';

export function IsRequest(validationOptions?: ValidationOptions) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: FindRequestValidation,
    });
  };
}

@ValidatorConstraint({ name: 'id', async: true })
@Injectable()
export class FindRequestValidation implements ValidatorConstraintInterface {
  constructor(public id: string) {}

  async validate(value: string, ctx): Promise<boolean> {
    const request = await prisma.request.findUnique({
      where: {
        id: value,
      },
    });

    if (!request) {
      throw new RequestNotFound();
    }

    return true;
  }
}
