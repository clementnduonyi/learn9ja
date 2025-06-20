/*
  Warnings:

  - You are about to drop the column `gender` on the `teacher_profiles` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "teacher_profiles" DROP COLUMN "gender";

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "gender" TEXT;
