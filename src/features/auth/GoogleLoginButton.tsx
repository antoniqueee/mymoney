"use client";

import { useState } from "react";
import { AlertCircle } from "lucide-react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

import { getSafeNextPath } from "./redirects";

function GoogleLogo() {
  return (
    <svg aria-hidden="true" className="size-5 fill-current" viewBox="0 0 640 640" role="img">
      <path d="M564 325.8C564 467.3 467.1 568 324 568C186.8 568 76 457.2 76 320C76 182.8 186.8 72 324 72C390.8 72 447 96.5 490.3 136.9L422.8 201.8C334.5 116.6 170.3 180.6 170.3 320C170.3 406.5 239.4 476.6 324 476.6C422.2 476.6 459 406.2 464.8 369.7L324 369.7L324 284.4L560.1 284.4C562.4 297.1 564 309.3 564 325.8z" />
    </svg>
  );
}

export interface GoogleLoginButtonProps {
  nextPath?: string;
}

export function GoogleLoginButton({ nextPath }: GoogleLoginButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>();

  async function handleSignIn() {
    setErrorMessage(undefined);
    setIsLoading(true);

    try {
      const supabase = createClient();
      const callbackUrl = new URL(
        "/auth/callback",
        window.location.origin,
      );
      callbackUrl.searchParams.set("next", getSafeNextPath(nextPath));

      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: callbackUrl.toString(),
          queryParams: {
            access_type: "offline",
            prompt: "consent",
          },
        },
      });

      if (error) throw error;
    } catch {
      setErrorMessage("Login Google belum dapat dimulai. Periksa koneksi lalu coba lagi.");
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-3">
      {errorMessage ? (
        <Alert variant="destructive">
          <AlertCircle aria-hidden="true" />
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      ) : null}
      <Button
        type="button"
        variant="outline"
        size="lg"
        className="w-full bg-surface shadow-xs hover:-translate-y-px hover:shadow-card"
        onClick={handleSignIn}
        isLoading={isLoading}
        loadingText="Menghubungkan ke Google..."
      >
        <GoogleLogo />
        Lanjutkan dengan Google
      </Button>
    </div>
  );
}
