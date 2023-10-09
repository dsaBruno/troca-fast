import { Injectable } from '@nestjs/common';
import {
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  registerDecorator,
} from 'class-validator';
import { UserAlreadyExist } from 'src/errors/user-already-exists-error';
import { prisma } from 'src/prisma/prisma.service';

export function isEmailUnique(validationOptions?: ValidationOptions) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: EmailValidation,
    });
  };
}

@ValidatorConstraint({ name: 'email', async: true })
@Injectable()
export class EmailValidation implements ValidatorConstraintInterface {
  constructor(public id: string) {}

  async validate(value: string, ctx): Promise<boolean> {
    const user = await prisma.user.findUnique({
      where: {
        email: value,
      },
    });

    if (user) {
      throw new UserAlreadyExist();
    }

    return true;
  }
}
