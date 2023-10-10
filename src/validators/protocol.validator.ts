import { IsNumber, IsOptional, IsString, Max } from 'class-validator';
import { IsProtocol } from './customs/find-protocol-by-id';
import { Prisma } from '@prisma/client';

export class GetProtocolDTO {
  @IsProtocol()
  @IsString()
  id: string;
}

export class AddProductProtocolDTO {
  @IsString()
  refId: string;

  @IsNumber()
  quantity: number;

  @IsString()
  reason_id: string;

  @IsString()
  description_reason: string;
}

export class ChangeValuesProtocolDTO {
  @IsNumber()
  freight_value: number;

  @IsNumber()
  total: number;
}

export class IndexProtocolDTO {
  @IsOptional()
  where: Prisma.ProtocolWhereInput;

  @IsOptional()
  orderBy: Prisma.ProtocolOrderByRelationAggregateInput;

  @IsNumber()
  page: number;

  @IsNumber()
  @Max(100)
  @IsOptional()
  perPage: number;
}
