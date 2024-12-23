import { Injectable } from '@nestjs/common';
import * as multer from 'multer';
import * as path from 'path';

@Injectable()
export class FileService {
  public static multerConfig = {
    storage: multer.diskStorage({
      destination: './uploads',
      filename: (req, file, callback) => {
        const ext = path.extname(file.originalname);
        callback(null, `${Date.now()}${ext}`);
      },
    }),
    fileFilter: (req, file, callback) => {
      const allowedTypes = ['image/jpeg', 'image/png'];
      if (!allowedTypes.includes(file.mimetype)) {
        return callback(new Error('Invalid file type. Only JPEG and PNG are allowed!'), false);
      }
      callback(null, true);
    },
    limits: {
      fileSize: 2 * 1024 * 1024, // Limit file size to 2MB
    },
  };
}
