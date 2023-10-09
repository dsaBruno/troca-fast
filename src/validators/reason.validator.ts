import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
} from 'class-validator';
import { Prisma } from '@prisma/client';
import { IsReason } from './customs/find-reason-by-id';

export class CreateReasonDTO {
  @IsNotEmpty()
  title: string;

  @IsNotEmpty()
  @IsEnum(['request', 'protocol'])
  action: string;
}

export class UpdateReasonDTO {
  @IsString()
  @IsOptional()
  title: string;

  @IsOptional()
  @IsEnum(['request', 'protocol'])
  action: string;
}

export class IndexReasonDTO {
  @IsOptional()
  where: Prisma.ReasonWhereInput;

  @IsOptional()
  orderBy: Prisma.ReasonOrderByWithRelationInput;

  @IsNumber()
  page: number;

  @IsNumber()
  @Max(100)
  @IsOptional()
  perPage: number;
}

export class GetReasonDTO {
  @IsReason()
  @IsString()
  id: string;
}
