const multer = require('multer');
const path = require('path');
const config = require('../config/config');

// INTENTIONAL VULN E1: No file type validation
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, config.upload.path);
  },
  filename: function(req, file, cb) {
    // INTENTIONAL VULN E3: Original filename used (path traversal possible)
    const filename = req.body.filename || file.originalname;
    cb(null, filename);
  }
});

// INTENTIONAL VULN E2: MIME type not validated, only extension
const fileFilter = (req, file, cb) => {
  // INTENTIONAL VULN E2: Blacklist instead of whitelist (bypassable)
  const blacklist = ['.exe', '.bat', '.sh'];
  const ext = path.extname(file.originalname).toLowerCase();
  
  if (blacklist.includes(ext)) {
    // INTENTIONAL VULN E2: Double extension bypass works
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
