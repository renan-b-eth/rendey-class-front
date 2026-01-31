/*
  Warnings:

  - You are about to drop the column `fileName` on the `Upload` table. All the data in the column will be lost.
  - Added the required column `filename` to the `Upload` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Upload" DROP COLUMN "fileName",
ADD COLUMN     "filename" TEXT NOT NULL;
