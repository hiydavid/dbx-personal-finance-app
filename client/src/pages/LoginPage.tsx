import { useState } from "react";
import { LogIn, User } from "lucide-react";

export function LoginPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      setError("Please enter an email address");
      return;
    }

    if (!email.includes("@")) {
      setError("Please enter a valid email address");
      return;
    }

    // Store the demo user email in localStorage
    localStorage.setItem("demoUserEmail", email.trim());

    // Navigate to dashboard and force a page reload to refresh all contexts
    window.location.href = "/dashboard";
  };

  return (
    <div className="min-h-screen bg-[var(--color-background)] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-[var(--color-accent-primary)] to-[var(--color-accent-primary)]/80 mb-4">
            <User className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-[var(--color-text-heading)]">
            Personal Finance App
          </h1>
          <p className="text-[var(--color-text-muted)] mt-2">
            Enter your email to view your financial data
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-[var(--color-bg-secondary)] rounded-xl border border-[var(--color-border)] p-6 shadow-sm">
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-[var(--color-text-primary)] mb-2"
              >
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError("");
                }}
                placeholder="Enter your email"
                className="w-full px-4 py-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-background)] text-[var(--color-foreground)] placeholder-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-primary)]/50 focus:border-[var(--color-accent-primary)] transition-colors"
              />
              {error && (
                <p className="mt-2 text-sm text-red-500">{error}</p>
              )}
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-gradient-to-r from-[var(--color-accent-primary)] to-[var(--color-accent-primary)]/90 text-white font-medium hover:opacity-90 transition-opacity"
            >
              <LogIn className="h-4 w-4" />
              Continue
            </button>
          </form>
        </div>

        {/* Footer Note */}
        <p className="text-center text-xs text-[var(--color-text-muted)] mt-6">
          Demo users: alice@company.com or bob@company.com
        </p>
      </div>
    </div>
  );
}
