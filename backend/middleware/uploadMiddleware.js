const multer = require("multer");

// Storage strategy (can be enhanced to store with original names or specific paths)
const storage = multer.diskStorage({});

// Allowed MIME types
const allowedTypes = [
  "application/pdf",
  "application/msword", // .doc
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
  "application/vnd.ms-powerpoint", // .ppt
  "application/vnd.openxmlformats-officedocument.presentationml.presentation", // .pptx
  "text/plain", // .txt
  "image/jpeg",
  "image/png",
];

// File type validation
const fileFilter = (req, file, cb) => {
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Unsupported file type"), false);
  }
};

// File size limit: 4MB = 4 * 1024 * 1024 bytes
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 4 * 1024 * 1024 },
});

module.exports = upload;
