import { Injectable } from '@nestjs/common';
import {
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  registerDecorator,
} from 'class-validator';
import { StatusNotFound } from 'src/errors/status-not-found-error';
import { prisma } from 'src/prisma/prisma.service';

export function IsStatus(validationOptions?: ValidationOptions) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: FindStatusValidation,
    });
  };
}

@ValidatorConstraint({ name: 'id', async: true })
@Injectable()
export class FindStatusValidation implements ValidatorConstraintInterface {
  constructor(public id: string) {}

  async validate(value: string, ctx): Promise<boolean> {
    const status = await prisma.status.findUnique({
      where: {
        id: value,
      },
    });

    if (!status) {
      throw new StatusNotFound();
    }

    return true;
  }
}
