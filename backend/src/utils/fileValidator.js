// Security: Validate files by magic bytes (actual content)
// not just extension or mimetype header which can be spoofed
const FileType = require('file-type');
const fileTypeFromBuffer = FileType.fromBuffer || FileType.fileTypeFromBuffer || FileType;

const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

const ALLOWED_EXTENSIONS = ['.pdf', '.jpg', '.jpeg', '.png', '.webp', '.doc', '.docx'];

const validateFileByMagicBytes = async (buffer) => {
  const type = await fileTypeFromBuffer(buffer);

  if (!type) {
    return { valid: false, reason: 'Could not determine file type' };
  }

  if (!ALLOWED_MIME_TYPES.includes(type.mime)) {
    return { valid: false, reason: `File type ${type.mime} is not allowed` };
  }

  return { valid: true, mime: type.mime, ext: type.ext };
};

const sanitizeFilename = (filename) => {
  // Remove path traversal characters and dangerous chars
  return filename
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/\.{2,}/g, '.')
    .slice(0, 255);
};

module.exports = { validateFileByMagicBytes, sanitizeFilename, ALLOWED_MIME_TYPES };