import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
} from 'class-validator';
import { Prisma } from '@prisma/client';
import { IsStatus } from './customs/find-status-by-id';

export class CreateStatusDTO {
  @IsNotEmpty()
  title: string;

  @IsNotEmpty()
  @IsEnum(['request', 'protocol'])
  group: string;
}

export class UpdateStatusDTO {
  @IsString()
  @IsOptional()
  title: string;

  @IsOptional()
  @IsEnum(['request', 'protocol'])
  group: string;
}

export class IndexStatusDTO {
  @IsOptional()
  where: Prisma.StatusWhereInput;

  @IsOptional()
  orderBy: Prisma.StatusOrderByWithRelationInput;

  @IsNumber()
  page: number;

  @IsNumber()
  @Max(100)
  @IsOptional()
  perPage: number;
}

export class GetStatusDTO {
  @IsStatus()
  @IsString()
  id: string;
}
