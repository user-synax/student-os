"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong");
        setIsLoading(false);
        return;
      }

      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result.error) {
        setError("Registration successful but login failed");
      } else {
        router.push("/dashboard");
      }
    } catch (error) {
      setError("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center relative z-10 px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 flex items-center gap-3 justify-center">
          <svg width="42" height="42" viewBox="0 0 42 42" fill="none" className="sm:w-[42px] sm:h-[42px] w-8 h-8">
            <circle cx="6" cy="6" r="4" fill="rgba(255,255,255,0.8)" />
            <circle cx="20" cy="6" r="4" fill="rgba(255,255,255,0.8)" />
            <circle cx="34" cy="6" r="4" fill="rgba(255,255,255,0.8)" />
            <circle cx="6" cy="20" r="4" fill="rgba(255,255,255,0.8)" />
            <circle cx="20" cy="20" r="4" fill="rgba(255,255,255,0.8)" />
            <circle cx="34" cy="20" r="4" fill="rgba(255,255,255,0.8)" />
            <circle cx="6" cy="34" r="4" fill="rgba(255,255,255,0.8)" />
            <circle cx="20" cy="34" r="4" fill="rgba(255,255,255,0.8)" />
            <circle cx="34" cy="34" r="4" fill="rgba(255,255,255,0.8)" />
          </svg>
          <span className="text-xl font-medium text-white/80 sm:text-xl text-lg">Student OS</span>
        </div>

        <div className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-lg p-6 sm:p-8">
          <h1 className="text-2xl font-semibold mb-2 sm:text-2xl text-xl">Create an account</h1>
          <p className="text-sm text-muted-foreground mb-6">Sign up to get started</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            {error && (
              <div className="text-red-400 text-sm">{error}</div>
            )}

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating account...
                </>
              ) : (
                "Create account"
              )}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm">
            Already have an account?{" "}
            <Link href="/login" className="text-primary hover:underline">
              Sign in →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
