-- CreateEnum
CREATE TYPE "DeviceType" AS ENUM ('PHONE', 'TABLET', 'NOTEBOOK', 'DESKTOP');

-- AlterTable
ALTER TABLE "Comment" ADD COLUMN     "important" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Device" ADD COLUMN     "type" "DeviceType";
