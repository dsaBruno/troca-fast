import { Injectable } from '@nestjs/common';
import {
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  registerDecorator,
} from 'class-validator';
import { ProductNotFound } from 'src/errors/product-not-found-error';
import { prisma } from 'src/prisma/prisma.service';

export function IsProduct(validationOptions?: ValidationOptions) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: FindProductValidation,
    });
  };
}

@ValidatorConstraint({ name: 'id', async: true })
@Injectable()
export class FindProductValidation implements ValidatorConstraintInterface {
  constructor(public id: string) {}

  async validate(value: string, ctx): Promise<boolean> {
    const product = await prisma.product.findUnique({
      where: {
        id: value,
      },
    });

    if (!product) {
      throw new ProductNotFound();
    }

    return true;
  }
}
