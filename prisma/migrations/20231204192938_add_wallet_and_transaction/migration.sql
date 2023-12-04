-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('INCOME', 'EXPENSE');

-- CreateTable
CREATE TABLE "wallet" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "balance" DECIMAL(65,30) DEFAULT 0.0,

    CONSTRAINT "wallet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transaction" (
    "id" SERIAL NOT NULL,
    "type" "TransactionType" NOT NULL DEFAULT E'EXPENSE',
    "title" TEXT NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "walletId" INTEGER,

    CONSTRAINT "transaction_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "transaction" ADD CONSTRAINT "transaction_walletId_fkey" FOREIGN KEY ("walletId") REFERENCES "wallet"("id") ON DELETE SET NULL ON UPDATE CASCADE;
