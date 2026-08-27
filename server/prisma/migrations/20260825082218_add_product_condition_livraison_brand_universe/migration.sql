-- CreateEnum
CREATE TYPE "ProductCondition" AS ENUM ('neuf', 'reconditionne', 'occasion');

-- AlterTable
ALTER TABLE "products" ADD COLUMN     "etat" "ProductCondition" NOT NULL DEFAULT 'neuf',
ADD COLUMN     "livraison_express" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "livraison_gratuite" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "_BrandCategories" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_BrandCategories_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_BrandCategories_B_index" ON "_BrandCategories"("B");

-- AddForeignKey
ALTER TABLE "_BrandCategories" ADD CONSTRAINT "_BrandCategories_A_fkey" FOREIGN KEY ("A") REFERENCES "brands"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BrandCategories" ADD CONSTRAINT "_BrandCategories_B_fkey" FOREIGN KEY ("B") REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;
