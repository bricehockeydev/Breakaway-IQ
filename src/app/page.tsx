import Link from "next/link";
import { auth } from "@/auth";
import { SKILLS } from "@/lib/hockey/skills";

const STEPS = [
  {
    title: "Pick a skill",
    body: "Wrist shot, slap shot, backhand, crossovers and more. Each one tells you exactly how to film it.",
  },
  {
    title: "Upload your clip",
    body: "A few seconds of one or two reps from your phone is all it takes.",
  },
  {
    title: "Get your breakdown",
    body: "AI grades every phase of the motion, flags your top flaws, and prescribes drills to fix them.",
  },
];

export default async function Home() {
  const session = await auth();

  return (
    <div className="mx-auto max-w-5xl px-4">
      <section className="py-16 sm:py-24">
        <p className="text-sm font-medium uppercase tracking-wide text-accent">
          AI hockey skill coaching
        </p>
        <h1 className="mt-3 max-w-2xl text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
          Film your shot. Get a coach&apos;s breakdown in a minute.
        </h1>
        <p className="mt-5 max-w-xl text-lg text-muted">
          Br.ice Skills Lab analyzes your technique frame by frame, tells you the one or two
          things holding you back, and gives you the drills to fix them.
        </p>
        <div className="mt-8 flex gap-3">
          <Link
            href={session?.user ? "/skills" : "/register"}
            className="rounded-lg bg-primary px-5 py-3 font-medium text-primary-fg hover:opacity-90"
          >
            {session?.user ? "Start an analysis" : "Get started"}
          </Link>
          <Link
            href="/login"
            className="rounded-lg border border-border px-5 py-3 font-medium hover:bg-surface"
          >
            Log in
          </Link>
        </div>
      </section>

      <section className="grid gap-6 pb-16 sm:grid-cols-3">
        {STEPS.map((s, i) => (
          <div key={s.title} className="rounded-xl border border-border bg-surface p-5">
            <div className="text-sm font-semibold text-accent">Step {i + 1}</div>
            <div className="mt-1 font-semibold">{s.title}</div>
            <p className="mt-2 text-sm text-muted">{s.body}</p>
          </div>
        ))}
      </section>

      <section className="pb-20">
        <h2 className="text-xl font-semibold">Skills you can analyze</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {SKILLS.map((s) => (
            <span
              key={s.key}
              className="rounded-full border border-border bg-surface px-3 py-1 text-sm text-muted"
            >
              {s.name}
            </span>
          ))}
        </div>
        <p className="mt-8 text-sm text-muted">
          Membership is $19/month for unlimited breakdowns.{" "}
          <Link href="/register" className="font-medium text-primary underline">
            Create an account
          </Link>{" "}
          to start.
        </p>
      </section>
    </div>
  );
}
