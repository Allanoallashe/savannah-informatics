"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/features/auth/context/AuthContext";
import { SignInForm } from "@/features/auth/components/SignInForm";

export default function LoginPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace("/stock");
    }
  }, [isAuthenticated, isLoading, router]);

  return <SignInForm />;
}
