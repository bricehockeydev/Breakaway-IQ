// Static drill library. Claude may ONLY recommend drills from this list (by key).
// `targetsFlaws` are plain-language tags the model matches against the flaws it finds.

export interface Drill {
  key: string;
  name: string;
  skillKeys: string[];
  targetsFlaws: string[];
  description: string;
  prescription: string; // sets / reps / frequency
}

export const DRILLS: Drill[] = [
  // --- Shooting: weight transfer / power ---
  {
    key: "step-into-shot",
    name: "Step-Into Shot",
    skillKeys: ["wrist-shot", "snap-shot", "backhand-shot"],
    targetsFlaws: [
      "no weight transfer",
      "shooting off back foot",
      "weak shot",
      "arms-only shot",
      "no lower body",
    ],
    description:
      "Start with feet together. Take a deliberate step toward the target with the front foot as you shoot, feeling weight move from back leg to front leg. Exaggerate the step at first.",
    prescription: "4 sets of 10, 3x/week",
  },
  {
    key: "kneeling-shots",
    name: "Kneeling Shooting",
    skillKeys: ["wrist-shot", "snap-shot"],
    targetsFlaws: [
      "arms-only shot",
      "poor blade load",
      "no stick flex",
      "weak wrist snap",
      "no puck spin",
    ],
    description:
      "On both knees, take shots using only hands, wrists and stick flex. Removes the legs so you're forced to load the blade and snap the release.",
    prescription: "3 sets of 15, 3x/week",
  },
  {
    key: "puck-drag-release",
    name: "Puck-Drag Release",
    skillKeys: ["wrist-shot", "snap-shot"],
    targetsFlaws: [
      "puck comes off blade early",
      "no puck drag",
      "pushing the puck",
      "early release",
      "no heel-to-toe roll",
    ],
    description:
      "Set the puck behind the back foot. Drag it along the ice the full length of the sweep, keeping it cupped, and only release once it's past your front foot. Focus on heel-to-toe roll.",
    prescription: "4 sets of 10, 3x/week",
  },
  {
    key: "target-shooting",
    name: "Corner Target Shooting",
    skillKeys: ["wrist-shot", "snap-shot", "slap-shot", "backhand-shot"],
    targetsFlaws: [
      "poor accuracy",
      "blade not pointing at target",
      "inconsistent follow-through",
      "missing the net",
    ],
    description:
      "Hang targets in the four corners of the net. Call your corner before each shot and finish with the blade pointed exactly where you aimed. Track make percentage.",
    prescription: "5 sets of 8 (2 per corner), 2–3x/week",
  },
  {
    key: "one-inch-behind",
    name: "One-Inch-Behind Slap Contact",
    skillKeys: ["slap-shot"],
    targetsFlaws: [
      "hitting ice too far behind puck",
      "topping the puck",
      "no stick flex on slap",
      "inconsistent slap contact",
    ],
    description:
      "Place a coin or tape mark ~1 inch behind the puck. Practice striking the mark so the shaft loads against the ice and whips through the puck. Slow-motion first, then build speed.",
    prescription: "3 sets of 10, 2x/week",
  },
  {
    key: "backhand-scoop",
    name: "Backhand Scoop Progression",
    skillKeys: ["backhand-shot"],
    targetsFlaws: [
      "backhand stays low",
      "can't elevate backhand",
      "no follow-through up",
      "weak backhand",
    ],
    description:
      "From in tight, scoop pucks over a stick laid flat 3 feet away, then over a low bench. Finish every rep with the blade following up toward the crossbar.",
    prescription: "4 sets of 10, 3x/week",
  },

  // --- Shooting: mechanics / hands ---
  {
    key: "hand-separation",
    name: "Hand-Separation Reps",
    skillKeys: ["wrist-shot", "snap-shot", "slap-shot"],
    targetsFlaws: [
      "hands too close together",
      "top hand into body",
      "cramped shot",
      "no leverage",
    ],
    description:
      "Shoot with a slightly wider hand spacing and the top hand pushed away from your body. The bottom hand should feel like it punches down/forward while the top hand pulls back.",
    prescription: "3 sets of 12, 3x/week",
  },
  {
    key: "quick-release-catch-shoot",
    name: "Catch-and-Shoot Quick Release",
    skillKeys: ["wrist-shot", "snap-shot"],
    targetsFlaws: [
      "slow release",
      "big windup",
      "telegraphing the shot",
      "long sweep",
    ],
    description:
      "Have a partner (or a rebounder board) feed you pucks. Shoot within half a second of the puck arriving — minimal backswing, all snap. Deception over power.",
    prescription: "5 sets of 10, 2–3x/week",
  },

  // --- Stickhandling / dekes ---
  {
    key: "wide-puck-control",
    name: "Wide Puck Control",
    skillKeys: ["forehand-deke"],
    targetsFlaws: [
      "puck slides away on the pull",
      "loses puck on deke",
      "puck too far from body",
      "poor puck control",
    ],
    description:
      "Stationary, move the puck from full forehand reach to full backhand reach and back, keeping it cupped the whole way. Then repeat walking forward. Soft hands, puck silent on the blade.",
    prescription: "3 sets of 60 seconds, daily",
  },
  {
    key: "cone-deke-finish",
    name: "Cone Deke-to-Finish",
    skillKeys: ["forehand-deke"],
    targetsFlaws: [
      "feet stop during deke",
      "glide through the move",
      "no shoulder fake",
      "move is not deceptive",
      "slow hands",
    ],
    description:
      "Attack a single cone at pace. Sell the forehand with a shoulder/weight fake, pull flat to the backhand past the cone while your feet keep moving, and finish on net.",
    prescription: "4 sets of 8, 2–3x/week",
  },
  {
    key: "head-up-stickhandling",
    name: "Head-Up Stickhandling",
    skillKeys: ["forehand-deke"],
    targetsFlaws: [
      "eyes down on the puck",
      "head down",
      "not scanning",
    ],
    description:
      "Stickhandle through a set of obstacles while reading hand signals from a partner (or cards on the wall) and calling them out. Forces eyes up while the hands work.",
    prescription: "3 sets of 90 seconds, daily",
  },

  // --- Skating ---
  {
    key: "crossover-full-extension",
    name: "Full-Extension Crossover Push",
    skillKeys: ["crossover-stride"],
    targetsFlaws: [
      "stepping over instead of pushing under",
      "no crossunder push",
      "short stride",
      "no leg extension",
      "not using outside edge",
    ],
    description:
      "Slow crossovers around the circle focusing only on the under-leg: push it fully under and out until the leg is straight and the toe points, then recover. Quality over speed.",
    prescription: "4 laps each direction, 3x/week",
  },
  {
    key: "circle-knee-bend",
    name: "Low-Circle Knee Bend Holds",
    skillKeys: ["crossover-stride"],
    targetsFlaws: [
      "standing too tall",
      "not enough knee bend",
      "high center of gravity",
      "poor posture on edges",
    ],
    description:
      "Hold a deep two-foot glide around the circle on the correct edges (outside edge inside skate) for as long as possible, chest up. Then add slow crossovers keeping that depth.",
    prescription: "6 holds each direction, 3x/week",
  },
  {
    key: "quick-feet-recovery",
    name: "Quick-Feet Recovery Crossovers",
    skillKeys: ["crossover-stride"],
    targetsFlaws: [
      "gliding between pushes",
      "slow foot recovery",
      "feet stay wide",
      "slow tempo",
    ],
    description:
      "Crossovers around the circle with an emphasis on snapping the pushed foot back under your hips as fast as possible, feet returning close together before the next push. Count pushes per lap and increase.",
    prescription: "4 laps each direction, 3x/week",
  },
];

export function getDrill(key: string): Drill | undefined {
  return DRILLS.find((d) => d.key === key);
}

export function drillsForSkill(skillKey: string): Drill[] {
  return DRILLS.filter((d) => d.skillKeys.includes(skillKey));
}
