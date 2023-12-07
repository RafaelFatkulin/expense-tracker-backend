/*
  Warnings:

  - Made the column `balance` on table `wallet` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "wallet" ALTER COLUMN "balance" SET NOT NULL;
