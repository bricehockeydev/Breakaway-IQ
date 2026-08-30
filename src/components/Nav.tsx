import Link from "next/link";
import { auth } from "@/auth";
import { logoutAction } from "@/app/actions/auth";

export async function Nav() {
  const session = await auth();
  const signedIn = !!session?.user;

  return (
    <header className="border-b border-border bg-surface">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 py-3">
        <Link
          href={signedIn ? "/dashboard" : "/"}
          className="shrink-0 whitespace-nowrap font-semibold tracking-tight"
        >
          Breakaway<span className="text-accent">&nbsp;IQ</span>
        </Link>

        <nav className="flex items-center gap-4 text-sm">
          {signedIn ? (
            <>
              <Link href="/skills" className="text-muted hover:text-foreground">
                Skills
              </Link>
              <Link href="/dashboard" className="text-muted hover:text-foreground">
                Dashboard
              </Link>
              <form action={logoutAction}>
                <button
                  type="submit"
                  className="rounded-md border border-border px-3 py-1.5 hover:bg-background"
                >
                  Sign out
                </button>
              </form>
            </>
          ) : (
            <>
              <Link href="/login" className="text-muted hover:text-foreground">
                Log in
              </Link>
              <Link
                href="/register"
                className="rounded-md bg-primary px-3 py-1.5 text-primary-fg hover:opacity-90"
              >
                Get started
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
