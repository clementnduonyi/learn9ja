-- CreateEnum
CREATE TYPE "SubscriptionTier" AS ENUM ('BASIC', 'PREMIUM', 'ENTERPRISE');

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "subscriptionTier" "SubscriptionTier" NOT NULL DEFAULT 'BASIC';
