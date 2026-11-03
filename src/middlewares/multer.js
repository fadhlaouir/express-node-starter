/* -------------------------------------------------------------------------- */
/*                                Dependencies                                */
/* -------------------------------------------------------------------------- */
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const multer = require('multer');
const { HttpError } = require('../utils/request');

/* -------------------------------------------------------------------------- */
/*                                Disk storage                                */
/* -------------------------------------------------------------------------- */
const UPLOAD_DIR = path.join(__dirname, '../../uploads');
const IMAGE_TYPES = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/gif': '.gif',
  'image/webp': '.webp',
};
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: UPLOAD_DIR,
  // A random name: the client never controls the path or the extension.
  filename: (req, file, cb) =>
    cb(null, `${crypto.randomUUID()}${IMAGE_TYPES[file.mimetype]}`),
});

const upload = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE, files: 6 },
  fileFilter: (req, file, cb) => {
    if (!IMAGE_TYPES[file.mimetype]) {
      return cb(
        new HttpError(422, 'Only JPEG, PNG, GIF and WebP images are allowed'),
      );
    }
    return cb(null, true);
  },
});

const fileUpload = upload.fields([
  { name: 'photo', maxCount: 1 },
  { name: 'gallery', maxCount: 5 },
]);

/**
 * Public path stored in the database for an uploaded file, e.g. "uploads/<name>.png".
 * @param {Express.Multer.File} file
 * @returns {string}
 */
const toPublicPath = (file) => `uploads/${file.filename}`;

/**
 * Delete a previously uploaded file. Ignores paths outside the upload folder.
 * @param {string} publicPath - Value stored in the database
 */
const removeUpload = async (publicPath) => {
  if (!publicPath) return;
  const filePath = path.join(UPLOAD_DIR, path.basename(publicPath));
  await fs.promises.rm(filePath, { force: true });
};

module.exports = { UPLOAD_DIR, fileUpload, toPublicPath, removeUpload };
