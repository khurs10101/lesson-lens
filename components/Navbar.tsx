"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Sparkles, Settings, LogOut, User, BookOpenCheck } from "lucide-react";
import { IS_AUTH_ENABLED } from "@/lib/flags";

interface NavbarProps {
  backHref?: string;
  rightSlot?: React.ReactNode;
}

export default function Navbar({ backHref, rightSlot }: NavbarProps) {
  const router = useRouter();
  const { data: session } = useSession();

  return (
    <nav className="border-b sticky top-0 z-40 bg-background/80 backdrop-blur-sm">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* Left */}
        <div className="flex items-center gap-3">
          {backHref && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => router.push(backHref)}
            >
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
            </Button>
          )}
          <Link href="/" className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <span className="font-bold text-lg">LessonLens</span>
          </Link>
        </div>

        {/* Right */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="gap-1 hidden sm:inline-flex"
            onClick={() => router.push("/methodology")}
          >
            <BookOpenCheck className="h-3.5 w-3.5" />
            Methodology
          </Button>
          {rightSlot}

          {IS_AUTH_ENABLED ? (
            <>
              {session ? (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => router.push("/settings")}
                    title="Settings"
                  >
                    <Settings className="h-4 w-4" />
                  </Button>
                  <div className="flex items-center gap-1.5">
                    {session.user.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={session.user.image}
                        alt={session.user.name ?? "User"}
                        className="h-7 w-7 rounded-full"
                      />
                    ) : (
                      <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="h-3.5 w-3.5 text-primary" />
                      </div>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      title="Sign out"
                      onClick={() => signOut({ callbackUrl: "/" })}
                    >
                      <LogOut className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </>
              ) : (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => router.push("/auth/signin")}
                >
                  Sign in
                </Button>
              )}
            </>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              title="Sign out"
              onClick={async () => {
                await fetch("/api/logout", { method: "POST" });
                router.push("/login");
                router.refresh();
              }}
            >
              <LogOut className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
}
