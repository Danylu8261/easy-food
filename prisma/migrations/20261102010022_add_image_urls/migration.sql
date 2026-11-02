/*
  Warnings:

  - You are about to alter the column `price` on the `Dish` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,2)` to `DoublePrecision`.
  - You are about to alter the column `rating` on the `Restaurant` table. The data in that column could be lost. The data in that column will be cast from `Decimal(2,1)` to `DoublePrecision`.
  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.
  - Made the column `category` on table `Restaurant` required. This step will fail if there are existing NULL values in that column.
  - Made the column `rating` on table `Restaurant` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Dish" DROP CONSTRAINT "Dish_restaurantId_fkey";

-- AlterTable
ALTER TABLE "Dish" ADD COLUMN     "imageUrl" TEXT,
ALTER COLUMN "name" SET DATA TYPE TEXT,
ALTER COLUMN "price" SET DATA TYPE DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "Restaurant" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "imageUrl" TEXT,
ALTER COLUMN "name" SET DATA TYPE TEXT,
ALTER COLUMN "category" SET NOT NULL,
ALTER COLUMN "category" SET DATA TYPE TEXT,
ALTER COLUMN "rating" SET NOT NULL,
ALTER COLUMN "rating" SET DEFAULT 0.0,
ALTER COLUMN "rating" SET DATA TYPE DOUBLE PRECISION;

-- DropTable
DROP TABLE "User";

-- AddForeignKey
ALTER TABLE "Dish" ADD CONSTRAINT "Dish_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "Restaurant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
