/*
  Warnings:

  - You are about to drop the column `transactionId` on the `transaction` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "transaction" DROP CONSTRAINT "transaction_transactionId_fkey";

-- AlterTable
ALTER TABLE "transaction" DROP COLUMN "transactionId",
ADD COLUMN     "transactionTagId" INTEGER;

-- AddForeignKey
ALTER TABLE "transaction" ADD CONSTRAINT "transaction_transactionTagId_fkey" FOREIGN KEY ("transactionTagId") REFERENCES "transaction_tag"("id") ON DELETE SET NULL ON UPDATE CASCADE;
