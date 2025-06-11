const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directories exist
const materialsDir = 'public/uploads/materials';
const avatarsDir = 'public/uploads/avatars';
[materialsDir, avatarsDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Materials storage configuration
const materialStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, materialsDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

// Avatar storage configuration
const avatarStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, avatarsDir);
  },
  filename: function (req, file, cb) {
    // Use userId for avatar filename for easy management
    const userId = req.user._id;
    cb(null, `avatar-${userId}${path.extname(file.originalname)}`);
  },
});

// Materials file filter
const materialFileFilter = (req, file, cb) => {
  const allowedFileTypes = ['.pdf', '.doc', '.docx', '.txt'];
  const ext = path.extname(file.originalname).toLowerCase();

  if (allowedFileTypes.includes(ext)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        'Invalid file type. Only PDF, DOC, DOCX and TXT files are allowed.'
      )
    );
  }
};

// Avatar file filter
const avatarFileFilter = (req, file, cb) => {
  const allowedFileTypes = ['.jpg', '.jpeg', '.png', '.gif'];
  const ext = path.extname(file.originalname).toLowerCase();

  if (allowedFileTypes.includes(ext)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        'Invalid file type. Only JPG, JPEG, PNG and GIF files are allowed.'
      )
    );
  }
};

// Configure uploads
const materialUpload = multer({
  storage: materialStorage,
  fileFilter: materialFileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

const avatarUpload = multer({
  storage: avatarStorage,
  fileFilter: avatarFileFilter,
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB limit for avatars
  },
});

module.exports = {
  materialUpload,
  avatarUpload,
};
