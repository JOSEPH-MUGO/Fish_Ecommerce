-- AlterTable
ALTER TABLE "products" ADD COLUMN     "isSustainable" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isWeekendOffer" BOOLEAN NOT NULL DEFAULT false;
