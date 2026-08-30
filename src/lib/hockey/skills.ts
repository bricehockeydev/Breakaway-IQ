// Static hockey skill library. Each skill defines how the player should film it
// and the phases + rubric Claude uses to grade the clip.

export type SkillCategory = "shooting" | "stickhandling" | "skating";

export interface SkillPhase {
  /** Machine key, referenced in the AI result. */
  key: string;
  /** Human label shown in the UI. */
  name: string;
  /** What good technique looks like in this phase — fed to the model. */
  checkpoints: string[];
}

export interface Skill {
  key: string;
  name: string;
  category: SkillCategory;
  blurb: string;
  /** Shown to the player before they record. */
  recordingInstructions: string[];
  phases: SkillPhase[];
}

export const SKILLS: Skill[] = [
  {
    key: "wrist-shot",
    name: "Wrist Shot",
    category: "shooting",
    blurb: "Quick, accurate shot with the puck cupped through a full sweep and snap.",
    recordingInstructions: [
      "Film from the side (camera perpendicular to your shot direction), full body in frame.",
      "Shoot toward a net or target ~10–15 feet away.",
      "Take 1–2 shots per clip. Keep the clip under 8 seconds.",
      "Good lighting; avoid backlight from a window.",
    ],
    phases: [
      {
        key: "setup",
        name: "Setup & Stance",
        checkpoints: [
          "Good knee bend, athletic base",
          "Front shin perpendicular to the ice",
          "Chest slightly forward, ~15° lean",
          "Hands roughly shoulder-width apart — not too close",
          "Hands out away from the body",
          "Puck starts back, off the heel of the blade",
        ],
      },
      {
        key: "weight-transfer",
        name: "Weight Transfer",
        checkpoints: [
          "Weight drives from the back leg to the front leg through the shot",
          "Hips rotate to finish square to the net",
          "Front knee stays bent — front shin stays perpendicular, doesn't straighten early",
        ],
      },
      {
        key: "loading",
        name: "Blade Load / Flex",
        checkpoints: [
          "Bottom hand is the driver — it powers the shot",
          "Significant, visible flex in the stick before release",
          "Hands stay near shoulder-width — too high or too low kills the flex",
          "Puck is dragged on the blade, traveling from back, through the body",
        ],
      },
      {
        key: "release",
        name: "Release",
        checkpoints: [
          "Puck releases in front of the front foot",
          "Puck rolls heel-to-toe off the blade with spin",
          "Wrists snap/roll at release",
        ],
      },
      {
        key: "follow-through",
        name: "Follow-through",
        checkpoints: [
          "Hips finish facing the net",
          "Head and eyes finish on the target",
          "Hands finish extended out toward the target, blade pointing at it",
          "Weight fully on the front leg, balanced finish",
        ],
      },
    ],
  },
  {
    key: "snap-shot",
    name: "Snap Shot",
    category: "shooting",
    blurb: "Hybrid of wrist and slap — a short, sharp cup-and-snap for a quick release.",
    recordingInstructions: [
      "Film from the side, full body in frame, shooting at a net/target 10–15 ft away.",
      "1–2 reps per clip, under 8 seconds.",
      "Shoot at game pace, not a slow demo.",
    ],
    phases: [
      {
        key: "setup",
        name: "Setup & Hands",
        checkpoints: [
          "Puck in the shooting box — out in front and close to the body, not way out to the side",
          "Hands away from the body (top hand off the hip), elbows up",
          "Athletic knee bend, weight loaded slightly on the back foot",
          "Eyes up and scanning, not locked on the puck",
        ],
      },
      {
        key: "cock",
        name: "Short Backswing",
        checkpoints: [
          "Small, compact backswing — blade rises only slightly",
          "No big windup — the shot should be deceptive and quick",
        ],
      },
      {
        key: "load",
        name: "Downward Load & Weight Transfer",
        checkpoints: [
          "Bottom hand (the engine) drives the blade down into the ice just behind the puck",
          "Push down through the shaft to load visible stick flex",
          "Weight transfers from the back foot to the front foot",
        ],
      },
      {
        key: "release",
        name: "Snap & Release",
        checkpoints: [
          "Both wrists snap as the blade contacts the puck",
          "Top hand pushes out then pulls back in to whip the blade through",
          "Puck leaves heel-to-toe with spin — quick, no long sweep",
        ],
      },
      {
        key: "follow-through",
        name: "Follow-through",
        checkpoints: [
          "Everything drives toward the target — hips, chest, blade all finish facing it",
          "Blade points at the target after release",
          "Weight fully on the front foot, compact and balanced finish",
        ],
      },
    ],
  },
  {
    key: "slap-shot",
    name: "Slap Shot",
    category: "shooting",
    blurb: "Maximum power shot with a full backswing and hard blade-to-ice contact behind the puck.",
    recordingInstructions: [
      "Film from the side, full body plus the full stick arc in frame.",
      "Shoot at a net 15–20 ft away. 1 rep per clip is fine.",
      "Under 8 seconds. Make sure the backswing isn't cut off by the frame.",
    ],
    phases: [
      {
        key: "approach",
        name: "Approach & Setup",
        checkpoints: [
          "Puck positioned off the front foot / mid-stance",
          "Feet roughly shoulder-width, knees bent",
          "Eyes up to the target before the windup",
        ],
      },
      {
        key: "backswing",
        name: "Backswing",
        checkpoints: [
          "Backswing to roughly hip/waist height (not way over the head)",
          "Top hand controls the arc, weight on the back leg",
        ],
      },
      {
        key: "contact",
        name: "Blade Contact / Flex",
        checkpoints: [
          "Blade strikes the ice 1–4 inches behind the puck",
          "Big visible shaft flex — the stick loads against the ice",
          "Weight transfers aggressively to the front leg",
        ],
      },
      {
        key: "release",
        name: "Release",
        checkpoints: [
          "Puck rolls off toe of the blade",
          "Hands roll through contact for accuracy",
          "Head stays down through contact",
        ],
      },
      {
        key: "follow-through",
        name: "Follow-through",
        checkpoints: [
          "Full follow-through, blade pointing at target",
          "Weight fully on the front leg, balanced",
        ],
      },
    ],
  },
  {
    key: "backhand-shot",
    name: "Backhand Shot",
    category: "shooting",
    blurb: "Controlled backhand sweep — key for in-tight scoring and dekeys.",
    recordingInstructions: [
      "Film from the side of your backhand, full body in frame.",
      "Shoot at a target 8–12 ft away, 1–2 reps per clip, under 8 seconds.",
    ],
    phases: [
      {
        key: "setup",
        name: "Setup",
        checkpoints: [
          "Puck cupped on the backhand side, behind the back foot",
          "Lower body loaded, knees bent",
          "Top hand out from the body",
        ],
      },
      {
        key: "sweep",
        name: "Sweep & Weight Transfer",
        checkpoints: [
          "Long sweep with the puck staying on the blade",
          "Weight drives back-to-front leg",
          "Hips rotate toward the target",
        ],
      },
      {
        key: "release",
        name: "Release",
        checkpoints: [
          "Puck lifts off the blade with a scooping wrist action",
          "Follow-through drives up to elevate the puck",
        ],
      },
      {
        key: "finish",
        name: "Finish",
        checkpoints: [
          "Blade points at the target, follow-through toward the top corner",
          "Balanced on the front leg",
        ],
      },
    ],
  },
  {
    key: "forehand-deke",
    name: "Forehand-to-Backhand Deke",
    category: "stickhandling",
    blurb: "1-on-0 move: sell the forehand, pull to the backhand, finish.",
    recordingInstructions: [
      "Film from behind or the front at a slight angle so the puck path is visible.",
      "Skate in, perform the deke past a cone/target, finish on net. Under 10 seconds.",
    ],
    phases: [
      {
        key: "approach",
        name: "Approach",
        checkpoints: [
          "Puck on the forehand, head up, controlled speed",
          "Hands away from the body for reach",
        ],
      },
      {
        key: "fake",
        name: "Forehand Fake",
        checkpoints: [
          "Believable weight shift / shoulder fake to the forehand side",
          "Puck pushed wide to sell the move",
        ],
      },
      {
        key: "pull",
        name: "Pull to Backhand",
        checkpoints: [
          "Quick, flat pull across the body to the backhand",
          "Puck stays close and controlled, not sliding away",
          "Feet keep moving — no glide/stall",
        ],
      },
      {
        key: "finish",
        name: "Finish",
        checkpoints: [
          "Puck moved to a shooting position",
          "Eyes up, controlled backhand or quick shot",
        ],
      },
    ],
  },
  {
    key: "crossover-stride",
    name: "Forward Crossovers",
    category: "skating",
    blurb: "Power generation through the turn — full crossunder push and recovery.",
    recordingInstructions: [
      "Film from outside the circle so the full stride and leg crossover are visible.",
      "Do 3–4 crossovers around a circle in each clip. Under 10 seconds.",
    ],
    phases: [
      {
        key: "posture",
        name: "Posture & Edges",
        checkpoints: [
          "Knees deeply bent, chest up, nose over toes",
          "Outside edge of the inside skate, inside edge of the outside skate",
        ],
      },
      {
        key: "crossunder",
        name: "Crossunder Push",
        checkpoints: [
          "Inside leg pushes fully under and out to the side (not just stepping over)",
          "Full leg extension on the push, toe finishes pointed",
        ],
      },
      {
        key: "recovery",
        name: "Recovery",
        checkpoints: [
          "Pushed leg recovers quickly back under the hips",
          "Feet return close together before the next push",
        ],
      },
      {
        key: "tempo",
        name: "Tempo & Balance",
        checkpoints: [
          "Quick foot turnover, no gliding between pushes",
          "Upper body stays quiet and balanced over the circle",
        ],
      },
    ],
  },
  {
    key: "forward-stride",
    name: "Forward Stride",
    category: "skating",
    blurb: "Straight-line speed — deep posture, full side extension, quick recovery under the body.",
    recordingInstructions: [
      "Film from the FRONT (skating toward the camera) or the SIDE — either works; front shows knee tracking, foot recovery and arm swing, side shows knee bend, extension and posture.",
      "Skate 4–6 hard strides straight at or past the camera. Keep the whole body in frame.",
      "Under 8 seconds. Game-pace strides, not a slow glide.",
    ],
    phases: [
      {
        key: "posture",
        name: "Posture & Stance",
        checkpoints: [
          "Roughly 135° angle at the knee (between the thigh and the calf)",
          "Chest up",
          "Head looking where the player wants to go",
          "Weight centered over the mid-foot, not on the heels",
        ],
      },
      {
        key: "push",
        name: "Push & Extension",
        checkpoints: [
          "Push out to the SIDE at ~45° with the steel (edge)",
          "Full leg extension — hip, knee and ankle all straighten",
          "Whole blade pushes, finishing with a toe snap",
          "Drive leg fully loaded before the push (no early release)",
        ],
      },
      {
        key: "recovery",
        name: "Recovery",
        checkpoints: [
          "Recovering foot comes back UNDER the body",
          "Feet return to shoulder-width apart between strides",
          "Quick recovery — foot doesn't trail behind the body",
        ],
      },
      {
        key: "glide-balance",
        name: "Glide & Balance",
        checkpoints: [
          "Balanced single-leg glide on a flat blade after each push",
          "Hips stay level — no big drop toward the gliding side",
          "No ankle wobble or upper-body sway to catch balance",
        ],
      },
      {
        key: "arms",
        name: "Arm Swing",
        checkpoints: [
          "Arm swing counteracts the leg drive at roughly a 45° angle",
          "Arms swing in line with the direction of travel, not across the body",
          "Shoulders relaxed, minimal side-to-side rotation",
        ],
      },
    ],
  },
];

export function getSkill(key: string): Skill | undefined {
  return SKILLS.find((s) => s.key === key);
}

export const SKILL_CATEGORY_LABELS: Record<SkillCategory, string> = {
  shooting: "Shooting",
  stickhandling: "Stickhandling",
  skating: "Skating",
};
