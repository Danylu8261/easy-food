const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Limpar registos anteriores para evitar duplicados
  await prisma.dish.deleteMany({});
  await prisma.restaurant.deleteMany({});

  // 1. Criar Restaurantes
  const rest1 = await prisma.restaurant.create({
    data: { name: "Craft Burger Studio", category: "Burger", rating: 4.8 }
  });

  const rest2 = await prisma.restaurant.create({
    data: { name: "Trattoria Della Nonna", category: "Massa", rating: 4.6 }
  });

  const rest3 = await prisma.restaurant.create({
    data: { name: "Sakura Fusion", category: "Sushi", rating: 4.9 }
  });

  // 2. Criar Pratos Personalizados
  await prisma.dish.createMany({
    data: [
      // Pratos do Craft Burger Studio
      {
        name: "Smash Trufado com Cogumelos",
        price: 38.90,
        description: "Pão brioche selado, 2x smash 90g, queijo gouda, cogumelos salteados e maionese trufada.",
        restaurantId: rest1.id
      },
      {
        name: "Batata Rústica com Alecrim e Páprica",
        price: 18.50,
        description: "Batatas cortadas à mão, aromatizadas com alecrim fresco e servidas com maionese verde da casa.",
        restaurantId: rest1.id
      },

      // Pratos da Trattoria Della Nonna
      {
        name: "Gnocchi de Baroa ao Pesto de Nozes",
        price: 44.00,
        description: "Nhoque artesanal de batata salsa com molho pesto fresco de manjericão e nozes crocantes.",
        restaurantId: rest2.id
      },
      {
        name: "Tiramisù com Café Espresso",
        price: 22.50,
        description: "Sobremesa italiana com camadas de biscoito champagne embebidas em café e creme mascarpone.",
        restaurantId: rest2.id
      },

      // Pratos do Sakura Fusion
      {
        name: "Hot Roll com Geleia de Pimenta",
        price: 32.00,
        description: "8 unidades de sushi empanado crocante, recheado com salmão e cream cheese, finalizado com tarê.",
        restaurantId: rest3.id
      },
      {
        name: "Poke Tropical de Atum Fresco",
        price: 46.90,
        description: "Base de arroz shari, atum fresco em cubos, manga, edamame, crisp de couve e gergelim.",
        restaurantId: rest3.id
      }
    ]
  });

  console.log("Restaurantes e pratos exclusivos inseridos com sucesso!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });