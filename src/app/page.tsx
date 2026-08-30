import Link from "next/link";
import { auth } from "@/auth";
import { SKILLS, SKILL_CATEGORY_LABELS, type SkillCategory } from "@/lib/hockey/skills";
import { Wordmark } from "@/components/brand/Wordmark";
import {
  IconClipboard,
  IconFilm,
  IconScissors,
  IconShooting,
  IconSkating,
  IconStick,
  IconTrend,
  PhaseStrip,
  RinkCorner,
} from "@/components/marketing/graphics";

const STEPS = [
  {
    icon: IconFilm,
    title: "Pick a skill & film it",
    body: "Wrist shot, snap shot, slap shot, backhand, forehand deke, forward stride, crossovers. Each one tells you exactly where to put the camera.",
  },
  {
    icon: IconScissors,
    title: "Trim to the rep",
    body: "A few seconds off your phone. Drag the handles to box in the one repetition you want looked at.",
  },
  {
    icon: IconClipboard,
    title: "Get the breakdown",
    body: "Every phase of the motion reviewed against real technique standards — setup, load, release, follow-through — with what's working and your top 2–3 fixes.",
  },
  {
    icon: IconTrend,
    title: "Track the change",
    body: "Re-upload in a few weeks. See your old rep beside the new one and which flaws are gone.",
  },
];

const CATEGORY_ICON: Record<SkillCategory, typeof IconShooting> = {
  shooting: IconShooting,
  skating: IconSkating,
  stickhandling: IconStick,
};

export default async function Home() {
  const session = await auth();
  const primaryHref = session?.user ? "/skills" : "/register";
  const primaryLabel = session?.user ? "Start an analysis" : "Get started";

  const byCategory = SKILLS.reduce<Record<string, typeof SKILLS>>((acc, s) => {
    (acc[s.category] ??= []).push(s);
    return acc;
  }, {});

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-brand-dark text-white">
        <RinkCorner className="pointer-events-none absolute -right-10 -top-10 h-72 w-72 text-white/20" />
        <RinkCorner className="pointer-events-none absolute -bottom-16 -left-16 h-72 w-72 rotate-180 text-white/10" />
        <div className="relative mx-auto max-w-5xl px-4 py-20 sm:py-28">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/60">
            Brice Hockey Development
          </p>
          <h1 className="mt-4 max-w-2xl text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl">
            Send in your shot. Get it broken down like you&apos;re in a private
            session.
          </h1>
          <p className="mt-5 max-w-xl text-lg text-white/75">
            <Wordmark onDark /> reviews your shot, stride and hands phase by phase
            against real technique standards, then hands you the exact drills to fix
            what&apos;s holding you back.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href={primaryHref}
              className="rounded-lg bg-white px-5 py-3 font-medium text-brand-dark transition-transform hover:-translate-y-0.5"
            >
              {primaryLabel}
            </Link>
            <Link
              href="/login"
              className="rounded-lg border border-white/25 px-5 py-3 font-medium text-white hover:bg-white/10"
            >
              Log in
            </Link>
          </div>
          <p className="mt-6 text-sm text-white/55">
            $19/month · unlimited breakdowns · cancel anytime
          </p>
        </div>
      </section>

      {/* Steps */}
      <section className="mx-auto max-w-5xl px-4 py-16">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">
          How it works
        </h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s, i) => (
            <div
              key={s.title}
              className="rounded-xl border border-border bg-surface p-5"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-tint text-primary">
                <s.icon className="h-5 w-5" />
              </div>
              <div className="mt-3 text-xs font-semibold text-accent">
                Step {i + 1}
              </div>
              <div className="mt-1 font-semibold">{s.title}</div>
              <p className="mt-2 text-sm leading-relaxed text-muted">{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* What a breakdown looks like */}
      <section className="rink-lines border-y border-border bg-surface-2">
        <div className="mx-auto max-w-5xl px-4 py-16">
          <h2 className="text-2xl font-bold tracking-tight">
            What a breakdown looks like
          </h2>
          <p className="mt-2 max-w-xl text-muted">
            Not a score out of ten. A phase-by-phase read of the actual motion, the
            priorities in order, and drills matched to each one.
          </p>

          <div className="mt-6 rounded-2xl border border-border bg-surface p-5 shadow-sm">
            <div className="text-xs font-semibold uppercase tracking-wide text-muted">
              Wrist shot · phase by phase
            </div>
            <div className="mt-3">
              <PhaseStrip
                phases={[
                  { name: "Setup", state: "fix" },
                  { name: "Weight transfer", state: "fix" },
                  { name: "Blade load", state: "fix" },
                  { name: "Release", state: "good" },
                  { name: "Follow-through", state: "good" },
                ]}
              />
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div>
                <div className="text-sm font-semibold">Top fixes</div>
                <ol className="mt-1 space-y-1 text-sm text-muted">
                  <li>
                    <span className="font-semibold text-accent">1.</span> Long,
                    telegraphed windup — the puck cradles for seconds before it goes
                  </li>
                  <li>
                    <span className="font-semibold text-accent">2.</span> Weight is
                    gained by spreading into a split, not stepping onto the front leg
                  </li>
                  <li>
                    <span className="font-semibold text-accent">3.</span> No visible
                    stick flex — the puck is swept, not loaded and snapped
                  </li>
                </ol>
              </div>
              <div>
                <div className="text-sm font-semibold">Your drills</div>
                <ul className="mt-1 space-y-1 text-sm text-muted">
                  <li>
                    <span className="font-medium text-foreground">
                      2×2 Box Release
                    </span>{" "}
                    — 4×15, 3x/week
                  </li>
                  <li>
                    <span className="font-medium text-foreground">Step-Into Shot</span>{" "}
                    — 4×15, 3x/week
                  </li>
                  <li>
                    <span className="font-medium text-foreground">
                      Single-Leg Shooting
                    </span>{" "}
                    — 4×15, 3x/week
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Skills */}
      <section className="mx-auto max-w-5xl px-4 py-16">
        <h2 className="text-2xl font-bold tracking-tight">Skills you can send in</h2>
        <div className="mt-6 space-y-8">
          {(Object.keys(byCategory) as SkillCategory[]).map((cat) => {
            const Icon = CATEGORY_ICON[cat];
            return (
              <div key={cat}>
                <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted">
                  <Icon className="h-4 w-4 text-primary" />
                  {SKILL_CATEGORY_LABELS[cat]}
                </div>
                <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {byCategory[cat].map((s) => (
                    <div
                      key={s.key}
                      className="rounded-xl border border-border bg-surface p-4"
                    >
                      <div className="font-semibold">{s.name}</div>
                      <p className="mt-1 text-sm text-muted">{s.blurb}</p>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border bg-brand-dark text-white">
        <div className="mx-auto flex max-w-5xl flex-col items-start gap-4 px-4 py-14 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">
              Ready to see your shot?
            </h2>
            <p className="mt-1 text-white/70">
              $19/month. Unlimited breakdowns. Cancel anytime.
            </p>
          </div>
          <Link
            href={primaryHref}
            className="rounded-lg bg-white px-5 py-3 font-medium text-brand-dark transition-transform hover:-translate-y-0.5"
          >
            {primaryLabel}
          </Link>
        </div>
      </section>
    </div>
  );
}
