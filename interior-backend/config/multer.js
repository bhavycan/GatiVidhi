const multer = require('multer');
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowed = [
    'image/jpeg', 'image/png', 'image/webp', 'image/jpg', 'application/pdf',
    'video/mp4', 'video/quicktime', 'video/webm', 'video/x-msvideo', 'video/avi',
  ];
  if (allowed.includes(file.mimetype)) cb(null, true);
  else cb(new Error('Only images, PDFs, and videos are allowed'), false);
};

const upload = multer({
  storage,
  limits: { fileSize: 200 * 1024 * 1024 }, // 200MB max (for videos)
  fileFilter,
});

module.exports = upload