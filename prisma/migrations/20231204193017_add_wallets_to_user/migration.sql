-- AlterTable
ALTER TABLE "wallet" ADD COLUMN     "userId" INTEGER;

-- AddForeignKey
ALTER TABLE "wallet" ADD CONSTRAINT "wallet_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
