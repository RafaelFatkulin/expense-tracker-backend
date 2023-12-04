/*
  Warnings:

  - Made the column `userId` on table `wallet` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "wallet" DROP CONSTRAINT "wallet_userId_fkey";

-- AlterTable
ALTER TABLE "wallet" ALTER COLUMN "userId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "wallet" ADD CONSTRAINT "wallet_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
