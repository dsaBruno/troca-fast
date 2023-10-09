import { Controller, Get, Param, Res } from '@nestjs/common';
import { Response } from 'express';
import * as path from 'path';
import { Public } from 'src/modules/decorators/auth.decorator';

@Controller('uploads')
export class FileController {
  @Public()
  @Get('/:filename')
  async getFile(@Res() res: Response, @Param() { filename }: any) {
    res.sendFile(path.join(process.cwd(), '/tmp/uploads/' + filename));
  }
}
