import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Req,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { Request } from 'express';
import { Public } from 'src/modules/decorators/auth.decorator';
import { RequestService } from 'src/services/request.service';
import { diskStorage } from 'multer';
import { extname } from 'path';
import {
  ApproveRequestDTO,
  CreateRequestDTO,
  GetRequestDTO,
  IndexRequestDTO,
  ReceivingRequestDTO,
} from 'src/validators/request.validator';
import { GetProductRequestDTO } from 'src/validators/product.validator';

@Controller('request')
export class RequestController {
  constructor(private readonly requestService: RequestService) {}

  @Public()
  @UseInterceptors(
    FilesInterceptor('files', 99, {
      storage: diskStorage({
        destination: './tmp/uploads/',
        filename: (req, file, cb) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          const fileExtName = extname(file.originalname);
          cb(null, `${uniqueSuffix}${fileExtName}`);
        },
      }),
    }),
  )
  @Post()
  async register(
    @Req() req: Request,
    @Body() body: CreateRequestDTO,
    @UploadedFiles() files,
  ) {
    return await this.requestService.register(req, body, files);
  }

  @Get('/:id')
  async show(@Req() req: Request, @Param() { id }: GetRequestDTO) {
    return await this.requestService.show(req, id);
  }

  @Post('/list')
  async index(@Req() req: Request, @Body() body: IndexRequestDTO) {
    return await this.requestService.index(req, body);
  }

  @Put('/:id/approve')
  async approve(
    @Req() req: Request,
    @Param() { id }: GetRequestDTO,
    @Body() body: ApproveRequestDTO,
  ) {
    return await this.requestService.approve(req, id, body);
  }

  @Put('/:id/receiving')
  async receiving(
    @Req() req: Request,
    @Param() { id }: GetRequestDTO,
    @Body() body: ReceivingRequestDTO[],
  ) {
    return await this.requestService.receiving(req, id, body);
  }

  @Put('/:id/delete/product/:product_id')
  async deleteProduct(
    @Req() req: Request,
    @Param() { id }: GetRequestDTO,
    @Param() { product_id }: GetProductRequestDTO,
  ) {
    return await this.requestService.deleteProduct(req, id, product_id);
  }

  @Put('/:id/add/product')
  @UseInterceptors(
    FilesInterceptor('files', 99, {
      storage: diskStorage({
        destination: './tmp/uploads/',
        filename: (req, file, cb) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          const fileExtName = extname(file.originalname);
          cb(null, `${uniqueSuffix}${fileExtName}`);
        },
      }),
    }),
  )
  async addProduct(
    @Req() req: Request,
    @Param() { id }: GetRequestDTO,
    @Body() body: IndexRequestDTO,
  ) {
    return null;
  }
}
