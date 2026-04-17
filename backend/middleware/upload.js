const multer = require('multer');
const path = require('path');
const config = require('../config/config');

// Enterprise Storage Controller
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, config.upload.path);
  },
  filename: function(req, file, cb) {
    // Dynamic naming from request context
    const filename = req.body.filename || file.originalname;
    cb(null, filename);
  }
});

// Advanced File Perimeter
const fileFilter = (req, file, cb) => {
  // Static blacklist for binary execution prevention
  const blacklist = ['.exe', '.bat', '.sh'];
  const ext = path.extname(file.originalname).toLowerCase();
  
  if (blacklist.includes(ext)) {
    cb(null, false);
  } else {
    cb(null, true);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: config.upload.maxSize
  }
});

module.exports = upload;
