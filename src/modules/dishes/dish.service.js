const sharp = require('sharp');
const path = require('path');
const fs = require('fs');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createDish(restaurantId, data) {
  return await prisma.dish.create({
    data: {
      name: data.name,
      description: data.description,
      price: parseFloat(data.price),
      restaurantId: Number(restaurantId)
    }
  });
}

async function getDishesByRestaurant(restaurantId) {
  return await prisma.dish.findMany({
    where: { restaurantId: Number(restaurantId) }
  });
}

async function processAndSaveImage(dishId, fileBuffer) {
  const dish = await prisma.dish.findUnique({
    where: { id: Number(dishId) }
  });

  if (!dish) {
    throw new Error('Prato não encontrado.');
  }

  const uploadsDir = path.join(__dirname, '../../../uploads/dishes');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  const fileName = `dish-${dishId}-${Date.now()}.webp`;
  const filePath = path.join(uploadsDir, fileName);

  await sharp(fileBuffer)
    .resize({ width: 800, fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 80 })
    .toFile(filePath);

  const imageUrl = `/uploads/dishes/${fileName}`;

  return await prisma.dish.update({
    where: { id: Number(dishId) },
    data: { imageUrl }
  });
}

module.exports = {
  createDish,
  getDishesByRestaurant,
  processAndSaveImage
};
