import { Injectable } from '@nestjs/common';
import {
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  registerDecorator,
} from 'class-validator';
import { ProtocolNotFound } from 'src/errors/protocol-not-found-error';
import { prisma } from 'src/prisma/prisma.service';

export function IsProtocol(validationOptions?: ValidationOptions) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: FindProtocolValidation,
    });
  };
}

@ValidatorConstraint({ name: 'id', async: true })
@Injectable()
export class FindProtocolValidation implements ValidatorConstraintInterface {
  constructor(public id: string) {}

  async validate(value: string, ctx): Promise<boolean> {
    const reason = await prisma.protocol.findUnique({
      where: {
        id: value,
      },
    });

    if (!reason) {
      throw new ProtocolNotFound();
    }

    return true;
  }
}
