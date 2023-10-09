import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as fs from 'fs';

@Injectable()
export class DeleteImagesMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    res.on('finish', () => {
      if (res.statusCode >= 400) {
        const filesToDelete: any = req.files;

        if (filesToDelete.length > 0) {
          filesToDelete.map((file) => {
            fs.unlinkSync(file.path);
          });
        } else {
          fs.unlinkSync(filesToDelete.path);
        }
      }
    });

    next();
  }
}
