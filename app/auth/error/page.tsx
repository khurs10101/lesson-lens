"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Sparkles, AlertTriangle } from "lucide-react";

const ERROR_MESSAGES: Record<string, string> = {
  OAuthSignin: "Could not start OAuth sign-in. Please try again.",
  OAuthCallback: "Error during OAuth callback. Please try again.",
  OAuthCreateAccount: "Could not create an account with this provider.",
  EmailCreateAccount: "Could not create an account with this email.",
  Callback: "There was a problem with the authentication callback.",
  OAuthAccountNotLinked:
    "This email is already registered with a different sign-in method.",
  CredentialsSignin: "Invalid email or password.",
  default: "An authentication error occurred. Please try again.",
};

export default function AuthErrorPage() {
  return (
    <Suspense>
      <AuthErrorContent />
    </Suspense>
  );
}

function AuthErrorContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const errorCode = searchParams.get("error") ?? "default";
  const message = ERROR_MESSAGES[errorCode] ?? ERROR_MESSAGES.default;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md text-center">
        <div className="flex items-center justify-center gap-2 mb-8">
          <Sparkles className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold">LessonLens</span>
        </div>

        <div className="rounded-xl border bg-card p-8 shadow-sm">
          <AlertTriangle className="h-10 w-10 text-destructive mx-auto mb-4" />
          <h2 className="text-lg font-semibold mb-2">Sign-in error</h2>
          <p className="text-sm text-muted-foreground mb-6">{message}</p>
          <Button onClick={() => router.push("/auth/signin")} className="w-full">
            Try again
          </Button>
        </div>
      </div>
    </div>
  );
}
