import multer from 'multer';
import path from 'path';

// Memory storage to process files directly in buffer
const storage = multer.memoryStorage();

// File filter strictly for .pdf and .txt files
const fileFilter = (
  _req: any,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const mime = file.mimetype.toLowerCase();

  const isPdf = ext === '.pdf' || mime === 'application/pdf';
  const isTxt = ext === '.txt' || mime === 'text/plain';

  if (isPdf || isTxt) {
    cb(null, true);
  } else {
    cb(new Error('Unsupported file format. Please upload only PDF (.pdf) or Text (.txt) files.'));
  }
};

export const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB max file size for large study documents
  },
  fileFilter,
});
