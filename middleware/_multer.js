import multer from 'multer';

async function uploadFile(path) {
  const upload = multer({
    storage: multer.diskStorage({
      destination: (req, file, cb) => {
        cb(null, path);
      },
      filename: (req, file, cb) => {
        cb(null, file.originalname);
      }
    }),
    limits: {
      fileSize: 1024 * 1024 * 5 // 5 MB
    },
    fileFilter: (req, file, cb) => {
      if (
        file.mimetype === 'image/jpeg' ||
        file.mimetype === 'image/png' ||
        file.mimetype === 'image/gif' ||
        file.mimetype === 'image/jpg' ||
        file.mimetype === 'application/pdf'
      ) {
        cb(null, true);
      } else {
        cb(new Error('Invalid file type.'));
      }
    }
  });
  return upload;
}

export { uploadFile };
