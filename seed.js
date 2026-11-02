const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const restaurant = await prisma.restaurant.upsert({
    where: { id: 1 },
    update: {},
    create: {
      name: "Restaurante Teste",
      description: "Descrição de teste",
      category: "Italiana"
    }
  });

  const dish = await prisma.dish.upsert({
    where: { id: 1 },
    update: {},
    create: {
      name: "Pizza Margherita",
      description: "Molho de tomate, mozarela e manjericão",
      price: 12.50,
      restaurantId: restaurant.id
    }
  });

  console.log("SUCESSO:", dish);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
