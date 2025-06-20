/*
  Warnings:

  - A unique constraint covering the columns `[phone]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "teacher_profiles" ADD COLUMN     "payout_details" JSONB;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "address" JSONB,
ADD COLUMN     "dob" DATE,
ADD COLUMN     "payment_method_details" JSONB,
ADD COLUMN     "phone" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "users_phone_key" ON "users"("phone");
