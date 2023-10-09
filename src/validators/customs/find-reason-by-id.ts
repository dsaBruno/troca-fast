import { Injectable } from '@nestjs/common';
import {
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  registerDecorator,
} from 'class-validator';
import { ReasonNotFound } from 'src/errors/reason-not-found-error';
import { prisma } from 'src/prisma/prisma.service';

export function IsReason(validationOptions?: ValidationOptions) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: FindReasonValidation,
    });
  };
}

@ValidatorConstraint({ name: 'id', async: true })
@Injectable()
export class FindReasonValidation implements ValidatorConstraintInterface {
  constructor(public id: string) {}

  async validate(value: string, ctx): Promise<boolean> {
    const reason = await prisma.reason.findUnique({
      where: {
        id: value,
      },
    });

    if (!reason) {
      throw new ReasonNotFound();
    }

    return true;
  }
}
