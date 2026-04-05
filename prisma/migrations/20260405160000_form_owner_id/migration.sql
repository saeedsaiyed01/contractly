-- AlterTable
ALTER TABLE "Form" ADD COLUMN "ownerId" TEXT;

-- CreateIndex
CREATE INDEX "Form_ownerId_idx" ON "Form"("ownerId");
