import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  Max,
  ValidateNested,
  isString,
} from 'class-validator';
import { Type } from 'class-transformer';
import { Prisma } from '@prisma/client';
import { IsRequest } from './customs/find-request-by-id';

class ProductsRequestDTO {
  @IsString()
  refId: string;

  @IsString()
  quantity: string;

  @IsString()
  reason_slug: string;

  @IsString()
  description_request: string;

  @IsEnum(['exchange', 'return'], {
    message: 'action must be one of the following values: exchange or return',
  })
  action: string;

  @IsArray()
  images: string[];
}

class ProductApproved {
  @IsString()
  product_id: string;

  @IsNumber()
  quantity: number;

  @IsString()
  @IsOptional()
  reason_slug: string;

  @IsString()
  @IsOptional()
  reason_refused_product: string;

  @IsBoolean()
  approved: boolean;
}

export class CreateRequestDTO {
  @IsEnum(['postal_service', 'physical_store'], {
    message:
      'action must be one of the following values: postal_service or physical_store',
  })
  shipping_method: string;

  @IsString()
  order_id: string;

  @IsEnum(['true', 'false'])
  @IsOptional()
  voucher: string;

  @IsString()
  @IsOptional()
  bank: string;

  @IsString()
  @IsOptional()
  agency: string;

  @IsString()
  @IsOptional()
  account: string;

  @IsString()
  @IsOptional()
  digit_account: string;

  @IsString()
  @IsOptional()
  type_key_pix: string;

  @IsString()
  @IsOptional()
  key_pix: string;

  @IsArray()
  @ValidateNested({
    each: false,
  })
  @Type(() => ProductsRequestDTO)
  products: ProductsRequestDTO[];
}

export class IndexRequestDTO {
  @IsOptional()
  where: Prisma.RequestWhereInput;

  @IsOptional()
  orderBy: Prisma.RequestOrderByWithRelationInput;

  @IsNumber()
  page: number;

  @IsNumber()
  @Max(100)
  @IsOptional()
  perPage: number;
}

export class GetRequestDTO {
  @IsRequest()
  @IsString()
  id: string;
}

export class ApproveRequestDTO {
  @IsBoolean()
  without_postage_code: boolean;

  @IsString()
  @IsOptional()
  reason_cancel_description: string;

  @IsArray()
  @ValidateNested({
    each: true,
  })
  @Type(() => ProductApproved)
  products: ProductApproved[];
}

export class ReceivingRequestDTO {
  @IsString()
  ean: string;

  @IsNumber()
  quantity: number;
}
