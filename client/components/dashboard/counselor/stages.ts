import type { CounselorStage } from "@/lib/types";

export const counselorStages: Array<{
  id: CounselorStage;
  label: string;
  detail: string;
}> = [
  {
    id: "goal_clarity",
    label: "Goal",
    detail: "Normalize the target outcome.",
  },
  {
    id: "baseline",
    label: "Baseline",
    detail: "Map current skills and gaps.",
  },
  {
    id: "constraints",
    label: "Constraints",
    detail: "Understand time, tools, and friction.",
  },
  {
    id: "success_target",
    label: "Success",
    detail: "Define evidence of mastery.",
  },
  {
    id: "review",
    label: "Review",
    detail: "Confirm the intake model.",
  },
  {
    id: "complete",
    label: "Profile",
    detail: "Compile learner profile.",
  },
];
