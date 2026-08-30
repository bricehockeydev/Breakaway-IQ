-- Video trim window
ALTER TABLE "Analysis" ADD COLUMN "trimStartSec" REAL;
ALTER TABLE "Analysis" ADD COLUMN "trimEndSec" REAL;
