import Link from "next/link";
import { FileText, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col justify-between bg-background p-6 md:p-12">
      {/* Brand Header */}
      <header className="flex items-center justify-between max-w-5xl w-full mx-auto select-none">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-semibold shadow-xs">
            <FileText className="h-4.5 w-4.5" />
          </div>
          <span className="text-base font-semibold tracking-tight text-foreground">
            Notes
          </span>
        </div>

        <nav className="flex items-center gap-3">
          <Link href="/posts">
            <Button variant="ghost" size="sm">
              Public Posts
            </Button>
          </Link>
          <Link href="/login">
            <Button variant="ghost" size="sm">
              Sign in
            </Button>
          </Link>
          <Link href="/register">
            <Button variant="primary" size="sm">
              Get started
            </Button>
          </Link>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="max-w-2xl mx-auto text-center py-16 sm:py-24 space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-surface text-xs text-foreground-muted shadow-2xs">
          <span>Personal knowledge workspace</span>
        </div>

        <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight text-foreground leading-[1.15]">
          Your thoughts, cleanly captured and structured.
        </h1>

        <p className="text-sm sm:text-base text-foreground-muted max-w-lg mx-auto leading-relaxed">
          A minimal, fast, and secure note-taking application designed for focus, clarity, and deep work.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
          <Link href="/posts" className="w-full sm:w-auto">
            <Button
              variant="primary"
              size="lg"
              className="w-full"
              rightIcon={<ArrowRight className="h-4 w-4" />}
            >
              Explore Public Posts
            </Button>
          </Link>
          <Link href="/notes" className="w-full sm:w-auto">
            <Button variant="outline" size="lg" className="w-full">
              My Notes
            </Button>
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-5xl w-full mx-auto text-center text-xs text-foreground-subtle py-4 select-none">
        <span>&copy; Note-Taking Application. Minimal, private, and secure.</span>
      </footer>
    </div>
  );
}
