import type { AnalysisResult } from "@/lib/claude";

export interface AnalysisDTO {
  id: string;
  skillKey: string;
  skillName: string;
  status: "processing" | "complete" | "failed";
  videoUrl: string;
  videoDurationSec: number | null;
  errorMessage: string | null;
  createdAt: string;
  result: AnalysisResult | null;
}
