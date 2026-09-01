"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "@/lib/auth/auth-client";
import { LogIn } from "lucide-react";

export default function SignIn() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { error } = await signIn.email({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      setError(error.message || "Invalid email or password");
      return;
    }

    router.push("/dashboard");
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <div className="mb-8 text-center">
        <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-(--primary)]/10 text-[var(--primary) mb-4">
          <LogIn className="h-7 w-7" />
        </div>
        <h1
          className="text-3xl font-bold mb-2"
          style={{ fontFamily: "Unbounded, sans-serif" }}
        >
          Sign In
        </h1>
        <p className="text-(--text-secondary)">Access the admin dashboard</p>
      </div>

      <div className="border border-(--border-color) bg-(--bg-glass) rounded-xl p-8">
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-(--text-secondary) mb-2">
              Email
            </label>
            <input
              type="email"
              placeholder="admin@sharkstream.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg bg-(--bg-secondary) border border-(--border-color) text-(--text-primary) placeholder-(--text-secondary)/60 focus:outline-none focus:border-(--primary)/50 transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-(--text-secondary) mb-2">
              Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg bg-(--bg-secondary) border border-(--border-color) text-(--text-primary) placeholder-(--text-secondary)/60 focus:outline-none focus:border-(--primary)/50 transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full px-6 py-2.5 rounded-lg bg-(--primary) text-(--text-inverse) font-medium hover:bg-(--primary-dark) transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-(--text-secondary)">
          <Link
            href="/"
            className="text-(--primary) hover:text-(--primary-dark)  transition-colors"
          >
            Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
