/*
  Warnings:

  - You are about to drop the column `createdAt` on the `Dish` table. All the data in the column will be lost.
  - You are about to alter the column `price` on the `Dish` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(10,2)`.
  - Made the column `description` on table `Dish` required. This step will fail if there are existing NULL values in that column.
  - Made the column `name` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Dish" DROP COLUMN "createdAt",
ALTER COLUMN "price" SET DATA TYPE DECIMAL(10,2),
ALTER COLUMN "description" SET NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "imageUrl" TEXT,
ALTER COLUMN "name" SET NOT NULL;
