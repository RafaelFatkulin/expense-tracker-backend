-- AlterTable
ALTER TABLE "transaction" ADD COLUMN     "createdAt" TIMESTAMP(6) NOT NULL DEFAULT timezone('UTC'::text, now());
