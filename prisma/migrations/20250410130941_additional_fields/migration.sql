-- CreateEnum
CREATE TYPE "TeacherStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED');

-- AlterTable
ALTER TABLE "bookings" ADD COLUMN     "calculated_price" DECIMAL(10,2),
ADD COLUMN     "end_time_utc" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "teacher_profiles" ADD COLUMN     "price_per_hour" DECIMAL(10,2),
ADD COLUMN     "status" "TeacherStatus" NOT NULL DEFAULT 'PENDING';
