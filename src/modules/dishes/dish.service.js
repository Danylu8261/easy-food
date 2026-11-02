const prisma = require("../../database/prisma");

exports.create = async (restaurantId, data) => {
  return await prisma.dish.create({
    data: {
      name: data.name,
      price: parseFloat(data.price),
      description: data.description || "",
      restaurantId: Number(restaurantId)
    }
  });
};

exports.listByRestaurant = async (restaurantId) => {
  return await prisma.dish.findMany({
    where: { restaurantId: Number(restaurantId) }
  });
};

