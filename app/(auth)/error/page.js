"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Loader2 } from "lucide-react";

function ErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  let errorMessage = "An unexpected authentication error occurred.";

  if (error === "Configuration") {
    errorMessage = "There is a problem with the server configuration. Please contact support.";
  } else if (error === "AccessDenied") {
    errorMessage = "You do not have permission to sign in.";
  } else if (error === "Verification") {
    errorMessage = "The token has expired or has already been used.";
  } else if (error === "OAuthSignin" || error === "OAuthCallback" || error === "OAuthCreateAccount" || error === "EmailCreateAccount" || error === "Callback" || error === "OAuthAccountNotLinked" || error === "EmailSignin" || error === "CredentialsSignin") {
     errorMessage = "There was a problem verifying your identity. Please try again.";
  }

  return (
    <div className="w-full max-w-md p-8 space-y-6 text-center bg-card border rounded-2xl shadow-xl">
      <div className="flex justify-center mb-4">
        <div className="p-4 bg-destructive/10 rounded-full">
          <AlertTriangle className="w-12 h-12 text-destructive" />
        </div>
      </div>
      <h1 className="text-2xl font-bold tracking-tight">Authentication Error</h1>
      <p className="text-muted-foreground">{errorMessage}</p>
      
      <div className="pt-4">
        <Link href="/login">
          <Button className="w-full">Back to Login</Button>
        </Link>
      </div>
    </div>
  );
}

export default function AuthErrorPage() {
  return (
    <div className="container flex items-center justify-center min-h-[80vh] py-12">
      <Suspense fallback={<Loader2 className="w-8 h-8 animate-spin text-primary" />}>
        <ErrorContent />
      </Suspense>
    </div>
  );
}