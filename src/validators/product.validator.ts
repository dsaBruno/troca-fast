import { IsString } from 'class-validator';
import { IsProduct } from './customs/find-product-by-id';

export class GetProductRequestDTO {
  @IsString()
  @IsProduct()
  product_id: string;
}

export class GetProductDTO {
  @IsString()
  @IsProduct()
  id: string;
}
