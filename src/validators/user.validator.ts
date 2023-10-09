import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  MinLength,
} from 'class-validator';
import { isEmailUnique } from './customs/find-user-email';
import { Prisma } from '@prisma/client';

export class CreateUserDTO {
  @Matches(/[A-Z][a-z]* [A-Z][a-z]*/, {
    message: 'Name and lastname required',
  })
  @MinLength(3)
  @IsNotEmpty()
  fullname: string;

  @IsEmail()
  @isEmailUnique()
  @IsNotEmpty()
  email: string;

  @IsString()
  @Matches(/(?=.*[@$!%*?&]).*$/, {
    message: 'At least 1 special character required',
  })
  @Matches(/(?=.*[a-z]).*$/, {
    message: 'At least 1 lower case letter required',
  })
  @Matches(/(?=.*[A-Z]).*$/, {
    message: 'At least 1 uppercase letter required',
  })
  @Matches(/(?=.*\d).*$/, {
    message: 'At least 1 number required',
  })
  @MaxLength(20)
  @MinLength(6)
  @IsNotEmpty()
  password: string;

  @IsEnum(['admin', 'member', 'client'], {
    message: 'The values in the type field must be: ( admin, member or client)',
  })
  @IsNotEmpty()
  type: string;
}

export class UpdateUserDTO {
  @Matches(/[A-Z][a-z]* [A-Z][a-z]*/, {
    message: 'Name and lastname required',
  })
  @MinLength(3)
  @IsOptional()
  fullname: string;

  @IsEmail()
  @isEmailUnique()
  @IsOptional()
  email: string;

  @IsEnum(['admin', 'member', 'client'], {
    message: 'The values in the type field must be: ( admin, member or client)',
  })
  @IsOptional()
  type: string;

  @IsBoolean()
  @IsOptional()
  is_active: boolean;
}

export class IndexUserDTO {
  @IsOptional()
  where: Prisma.UserWhereInput;

  @IsOptional()
  orderBy: Prisma.UserOrderByWithRelationInput;

  @IsNumber()
  page: number;

  @IsNumber()
  @Max(100)
  @IsOptional()
  perPage: number;
}
