// Static drill library. Claude may ONLY recommend drills from this list (by key).
// `targetsFlaws` are plain-language tags the model matches against the flaws it finds.

export interface Drill {
  key: string;
  name: string;
  skillKeys: string[];
  targetsFlaws: string[];
  description: string;
  prescription: string; // sets / reps / frequency
  /** Optional demo video — a YouTube URL or an uploaded clip URL. */
  videoUrl?: string;
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
    prescription: "4 sets of 15, 3x/week",
  },
  {
    key: "single-leg-shooting",
    name: "Single-Leg Shooting",
    skillKeys: ["wrist-shot", "snap-shot", "backhand-shot"],
    targetsFlaws: [
      "no weight transfer",
      "shooting off back foot",
      "poor balance",
      "arms-only shot",
      "weak lower-body drive",
      "straightening the front leg early",
    ],
    description:
      "Balance on your front leg only, back foot off the ice, and shoot. Forces you to hold a bent front knee, keep your weight forward through the release, and drive the shot from the hip instead of the arms.",
    prescription: "4 sets of 15, 3x/week",
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
      "Set the puck behind the back foot. Drag it along the ice the full length of the sweep, keeping it cupped, and only release once it's in front of your front foot. Focus on heel-to-toe roll.",
    prescription: "4 sets of 15, 3x/week",
  },
  {
    key: "hips-to-net",
    name: "Hips-to-Net Finish",
    skillKeys: ["wrist-shot", "snap-shot", "backhand-shot"],
    targetsFlaws: [
      "hips don't finish facing the net",
      "no hip rotation",
      "chest stays sideways",
      "head not finishing on target",
    ],
    description:
      "Shoot and freeze the finish for a two-count. Check that your belt buckle and chest are square to the net and your head is pointed at your target. Reset and repeat — groove the rotation before adding pace.",
    prescription: "4 sets of 15, 3x/week",
  },
  {
    key: "shooting-box",
    name: "2×2 Box Release",
    skillKeys: ["wrist-shot", "snap-shot"],
    targetsFlaws: [
      "long telegraphed sweep",
      "puck held too far to the side",
      "slow release",
      "big windup",
      "puck travels too far before release",
    ],
    description:
      "Draw a 2 ft × 2 ft box on the ice in front of your shooting side (marker, or four pucks as corners). Every rep the puck must start and release inside that box — no sweeping it out wide. Then put a puck in the middle as an obstacle and shoot around it, forcing a tight, quick release.",
    prescription: "4 sets of 15, 3x/week",
  },
  {
    key: "front-shin-shooting",
    name: "Front-Shin Perpendicular Shooting",
    skillKeys: ["wrist-shot", "snap-shot"],
    targetsFlaws: [
      "front shin not perpendicular to the ice",
      "front leg straightens early",
      "standing too tall on the shot",
      "not enough knee bend",
      "shooting off the back foot",
    ],
    description:
      "Set up with your front shin straight up and down (perpendicular to the ice) and hold that shin angle all the way through the release — don't let the front knee straighten. Film from the side to check.",
    prescription: "4 sets of 15, 3x/week",
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
    prescription: "4 sets of 15 (rotate corners), 2–3x/week",
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
    prescription: "4 sets of 15, 2x/week",
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
    prescription: "4 sets of 15, 3x/week",
  },

  // --- Shooting: mechanics / hands ---
  {
    key: "hand-separation",
    name: "Hand-Separation Reps",
    skillKeys: ["wrist-shot", "snap-shot", "slap-shot"],
    targetsFlaws: [
      "hands too close together",
      "hands too high or too low on the shaft",
      "top hand into body",
      "cramped shot",
      "no leverage",
      "not enough stick flex",
    ],
    description:
      "Shoot with hands about shoulder-width apart and the top hand pushed away from your body. Hands too high or too low on the shaft kill the flex. Bottom hand punches down/forward (it's the engine), top hand pulls back.",
    prescription: "4 sets of 15, 3x/week",
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
    prescription: "4 sets of 15, 2–3x/week",
  },
  {
    key: "two-stick-channel",
    name: "Two-Stick Channel",
    skillKeys: ["wrist-shot", "snap-shot"],
    targetsFlaws: [
      "puck held too far to the side",
      "long sweep",
      "puck drags away from the body",
      "poor hand path",
      "slow release",
    ],
    description:
      "Lay two sticks on the ice pointing at the net, a little wider than a puck apart. Shoot with the puck travelling straight down that channel. Feels cramped at first — that's the point: it forces the puck to stay close and your hands and feet to do the work.",
    prescription: "4 sets of 15, 2–3x/week",
  },
  {
    key: "seventy-percent-mechanics",
    name: "70% Mechanics Reps",
    skillKeys: ["wrist-shot", "snap-shot", "backhand-shot"],
    targetsFlaws: [
      "muscling the shot",
      "poor mechanics under effort",
      "rushing reps",
      "inconsistent release",
    ],
    description:
      "Stationary, shoot at about 70% effort and think only about the checkpoints — puck behind the back foot, heel-to-toe roll, weight to the front leg, blade finishing at the target. Slow, clean reps groove the pattern faster than max-effort ones.",
    prescription: "3 sets of 20, 3–4x/week",
  },
  {
    key: "shoot-around-obstacle",
    name: "Shoot Around a Stick",
    skillKeys: ["wrist-shot", "snap-shot", "slap-shot"],
    targetsFlaws: [
      "shot gets blocked",
      "can't change the release angle",
      "predictable release point",
      "long sweep",
    ],
    description:
      "Plant a spare stick upright (or lay one flat) between you and the net as an obstacle. Release your shot around it — over, or off to one side — without a big windup. Trains getting the puck through traffic and disguising where the shot comes from. Works on-ice, off-ice, or on rollerblades.",
    prescription: "4 sets of 12, 2x/week",
  },
  {
    key: "rapid-fire",
    name: "Rapid Fire",
    skillKeys: ["wrist-shot", "snap-shot"],
    targetsFlaws: [
      "slow reset between shots",
      "mechanics break down when tired",
      "slow release",
    ],
    description:
      "Line up 10 pucks. Shoot each one as fast as you can pull the next into position — but every rep must still have a clean release and a follow-through at the target. Rest, repeat. Builds a quick release that holds up under fatigue.",
    prescription: "5 sets of 10, 2x/week",
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

  // --- Skating: forward stride ---
  {
    key: "stride-full-extension",
    name: "Full-Extension Stride Push",
    skillKeys: ["forward-stride"],
    targetsFlaws: [
      "short stride",
      "no full leg extension",
      "pushing back instead of to the side",
      "toe not finishing pointed",
      "choppy stride",
    ],
    description:
      "Long, slow strides down the ice. On every push drive the leg out to 45° and finish fully extended with the toe snapping out, then hold a one-second glide on the other leg before the next push. Feel the whole blade push, not just the toe.",
    prescription: "6 lengths of the ice, 3x/week",
  },
  {
    key: "stride-knee-drive-recovery",
    name: "Knee-Drive Recovery",
    skillKeys: ["forward-stride"],
    targetsFlaws: [
      "slow recovery",
      "foot recovers wide",
      "no knee drive",
      "recovering behind the body",
      "gliding too long between strides",
    ],
    description:
      "After each push, drive the recovering knee forward and land the foot back under your center of mass — not out to the side. Think 'knee to the boards you're skating toward.' Build to a quick, continuous tempo.",
    prescription: "6 lengths of the ice, 3x/week",
  },
  {
    key: "stride-posture-holds",
    name: "Low Athletic Posture Holds",
    skillKeys: ["forward-stride"],
    targetsFlaws: [
      "standing too tall",
      "not enough knee bend",
      "bent at the waist",
      "chest down",
      "high center of gravity",
    ],
    description:
      "Hold a deep two-foot glide the length of the ice: ~135° knee angle, chest up, eyes up where you're going. Then add slow strides while keeping that exact posture. If you stand up on the push, restart.",
    prescription: "6 lengths of the ice, 3x/week",
  },
  {
    key: "stride-arm-drive",
    name: "Front-to-Back Arm Drive",
    skillKeys: ["forward-stride"],
    targetsFlaws: [
      "arms crossing the body",
      "stick-hand not driving",
      "no arm swing",
      "upper body rotating side to side",
      "tense shoulders",
    ],
    description:
      "Stride with the arms swinging straight front-to-back in line with your direction of travel (not across the body), staying relaxed. On a full-speed stride the arms should match the leg tempo and add drive, not just balance.",
    prescription: "4 lengths of the ice, 2–3x/week",
  },
  {
    key: "one-leg-push-glide",
    name: "One-Leg Push & Glide",
    skillKeys: ["forward-stride"],
    targetsFlaws: [
      "short stride",
      "no full leg extension",
      "choppy stride",
      "pushing back instead of to the side",
    ],
    description:
      "Push once with one leg, then glide the length of the ice on the other in a straight line, holding balance. Push out to the side, extend fully, snap the toe. Alternate legs each length. All about the quality of a single push.",
    prescription: "6 lengths each leg, 3x/week",
  },
  {
    key: "toe-drag-stride",
    name: "Toe-Drag Stride",
    skillKeys: ["forward-stride"],
    targetsFlaws: [
      "no full leg extension",
      "toe not finishing pointed",
      "cutting the push short",
      "short stride",
    ],
    description:
      "After each push, drag the toe of the pushing skate along the ice behind you before you recover it. Exaggerates and grooves the feeling of a complete extension so you stop cutting the stride short.",
    prescription: "6 lengths of the ice, 3x/week",
  },
  {
    key: "edge-holds",
    name: "Inside / Outside Edge Holds",
    skillKeys: ["forward-stride", "crossover-stride"],
    targetsFlaws: [
      "ankle wobble",
      "weak edges",
      "poor single-leg balance",
      "loses balance on the glide",
    ],
    description:
      "Glide the length of the ice on one foot holding an inside edge, then again on an outside edge, each leg. Build the ankle and edge strength the stride and crossovers depend on. Progress to slow figure-eights on each edge.",
    prescription: "2 lengths per edge per leg, 3x/week",
  },
];

export function getDrill(key: string): Drill | undefined {
  return DRILLS.find((d) => d.key === key);
}

export function drillsForSkill(skillKey: string): Drill[] {
  return DRILLS.filter((d) => d.skillKeys.includes(skillKey));
}
