const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function processAndSaveImage(buffer, folder, prefix) {
  const uploadDir = path.join(__dirname, '..', '..', 'uploads', folder);

  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const filename = `${prefix}-${Date.now()}.webp`;
  const filepath = path.join(uploadDir, filename);

  await sharp(buffer)
    .resize(800, 800, { fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 80 })
    .toFile(filepath);

  return `/uploads/${folder}/${filename}`;
}

module.exports = { processAndSaveImage };
