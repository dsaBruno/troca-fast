import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { diskStorage } from 'multer';
import { Observable } from 'rxjs';
import { multerOptions } from '../../configs/multer.options';

@Injectable()
export class FileUploadInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const multerStorage = diskStorage({
      destination: './tmp/uploads', // Defina a pasta de destino com base no ID do produto
      filename: (req, file, cb) => {
        // Modifique o nome do arquivo com base no ID do produto
        const fileName = `${file.originalname}`;
        cb(null, fileName);
      },
    });

    // Atualize as opções de armazenamento do Multer
    multerOptions.storage = multerStorage;

    return next.handle();
  }
}
