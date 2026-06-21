import multer from 'multer';

const ALLOWED_MIMES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif'];
const EXT_PATTERN = /\.(jpe?g|png|webp|avif|gif)$/i;
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

const storage = multer.memoryStorage();

function isAllowedImage(file: Express.Multer.File): boolean {
  if (ALLOWED_MIMES.includes(file.mimetype)) return true;
  // Windows often sends application/octet-stream or empty mimetype
  if ((!file.mimetype || file.mimetype === 'application/octet-stream') && EXT_PATTERN.test(file.originalname)) {
    return true;
  }
  return false;
}

function fileFilter(
  _req: Express.Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback,
): void {
  if (!isAllowedImage(file)) {
    cb(new Error('Only image files (JPEG, PNG, WebP, AVIF, GIF) are allowed'));
    return;
  }
  cb(null, true);
}

export const uploadSingle = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE, files: 1 },
  fileFilter,
}).single('file');

export const uploadBulk = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE, files: 10 },
  fileFilter,
}).array('files', 10);
