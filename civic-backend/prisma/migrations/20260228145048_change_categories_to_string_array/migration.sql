/*
  Warnings:

  - The `categories` column on the `Department` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Department" DROP COLUMN "categories",
ADD COLUMN     "categories" TEXT[];
