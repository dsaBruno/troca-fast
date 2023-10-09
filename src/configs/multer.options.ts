import { diskStorage } from 'multer';

export const multerOptions = {
  storage: diskStorage({
    destination: './tmp/uploads',
    filename: (req, file, cb) => {
      const fileName = `${Date.now()}_${file.originalname}`;
      cb(null, fileName);
    },
  }),
};
