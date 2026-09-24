const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  // Limpa a tabela antes, para poder rodar o seed mais de uma vez sem duplicar.
  await prisma.restaurant.deleteMany();

  await prisma.restaurant.createMany({
    data: [
      // Pizza
      { name: "Margô Margherita", category: "Pizza", rating: 4.7 },
      { name: "Calabresa Clube", category: "Pizza", rating: 4.5 },
      { name: "Fatia Feliz", category: "Pizza", rating: 4.3 },
      // Burger
      { name: "Burger de Responsa", category: "Burger", rating: 4.6 },
      { name: "Chapa Quente", category: "Burger", rating: 4.4 },
      { name: "Bacon Bandido", category: "Burger", rating: 4.1 },
      // Sushi
      { name: "Salmão Rebelde", category: "Sushi", rating: 4.8 },
      { name: "Sushi Pop", category: "Sushi", rating: 4.5 },
      { name: "Rolê Oriental", category: "Sushi", rating: 4.2 },
      // Saudável
      { name: "Folha Solta", category: "Saudável", rating: 4.7 },
      { name: "Tigela Zen", category: "Saudável", rating: 4.6 },
      { name: "Alface Total", category: "Saudável", rating: 4.4 }
    ]
  });
  console.log("Restaurantes inseridos com sucesso!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());