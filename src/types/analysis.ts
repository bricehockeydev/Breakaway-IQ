import type { AnalysisResult } from "@/lib/claude";

export interface AnalysisDTO {
  id: string;
  skillKey: string;
  skillName: string;
  status: "draft" | "processing" | "complete" | "failed";
  videoUrl: string;
  videoDurationSec: number | null;
  trimStartSec: number | null;
  trimEndSec: number | null;
  errorMessage: string | null;
  createdAt: string;
  result: AnalysisResult | null;
}
