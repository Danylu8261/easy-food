const prisma = require("../../database/prisma");

exports.list = async () => {
  return await prisma.restaurant.findMany();
};

exports.create = async (data) => {
  return await prisma.restaurant.create({ data });
};

exports.remove = async (id) => {
  return await prisma.restaurant.delete({
    where: { id: Number(id) }
  });
};
