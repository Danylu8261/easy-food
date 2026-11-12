const prisma = require('../../database/prisma');
const imageService = require('../../shared/image.service');

async function createDish(restaurantId, data) {
  const restaurant = await prisma.restaurant.findUnique({
    where: { id: Number(restaurantId) }
  });

  if (!restaurant) {
    const error = new Error('Restaurante não encontrado.');
    error.status = 404;
    throw error;
  }

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
    const error = new Error('Prato não encontrado.');
    error.status = 404;
    throw error;
  }

  const imageUrl = await imageService.processAndSaveImage(
    fileBuffer,
    'dishes',
    `dish-${dishId}`
  );

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
