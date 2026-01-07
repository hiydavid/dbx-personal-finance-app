import { useState } from "react";
import { LogIn, TrendingUp, Shield, Sparkles } from "lucide-react";

export function LoginPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      setError("Please enter an email address");
      return;
    }

    if (!email.includes("@")) {
      setError("Please enter a valid email address");
      return;
    }

    setIsLoading(true);

    // Simulate a brief delay for better UX
    await new Promise(resolve => setTimeout(resolve, 500));

    // Store the demo user email in localStorage
    localStorage.setItem("demoUserEmail", email.trim());

    // Navigate to dashboard and force a page reload to refresh all contexts
    window.location.href = "/dashboard";
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg-primary)] flex overflow-hidden">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-[var(--color-bg-secondary)] to-[var(--color-bg-primary)]">
        {/* Animated gradient orb */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[var(--color-accent-primary)]/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-[var(--color-accent-primary)]/10 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '1s' }} />

        <div className="relative z-10 flex flex-col justify-center p-12 lg:p-16">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-12">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[var(--color-accent-primary)] to-[var(--color-accent-primary)]/70 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-[var(--color-text-heading)]">
              Finance
            </span>
          </div>

          {/* Tagline */}
          <h1 className="text-4xl lg:text-5xl font-bold text-[var(--color-text-heading)] leading-tight mb-6">
            Your finances,<br />
            <span className="text-[var(--color-accent-primary)]">beautifully organized.</span>
          </h1>

          <p className="text-lg text-[var(--color-text-muted)] mb-12 max-w-md">
            Track your net worth, manage cashflow, and get AI-powered insights to make smarter financial decisions.
          </p>

          {/* Feature highlights */}
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-[var(--color-accent-primary)]/10 flex items-center justify-center">
                <Shield className="w-5 h-5 text-[var(--color-accent-primary)]" />
              </div>
              <div>
                <p className="text-sm font-medium text-[var(--color-text-primary)]">Secure & Private</p>
                <p className="text-xs text-[var(--color-text-muted)]">Your data stays yours</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-[var(--color-accent-primary)]/10 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-[var(--color-accent-primary)]" />
              </div>
              <div>
                <p className="text-sm font-medium text-[var(--color-text-primary)]">AI-Powered Insights</p>
                <p className="text-xs text-[var(--color-text-muted)]">Smart recommendations for your goals</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[var(--color-accent-primary)] to-[var(--color-accent-primary)]/70 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-[var(--color-text-heading)]">
              Finance
            </span>
          </div>

          {/* Form Card */}
          <div className="bento-card p-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-[var(--color-text-heading)] mb-2">
                Welcome back
              </h2>
              <p className="text-[var(--color-text-muted)]">
                Enter your email to access your dashboard
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
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
                  placeholder="you@company.com"
                  className="w-full px-4 py-3.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-primary)] text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-primary)]/50 focus:border-[var(--color-accent-primary)] transition-all"
                  autoFocus
                />
                {error && (
                  <p className="mt-2 text-sm text-[var(--color-error)]">{error}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl btn-floating text-white font-semibold disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <LogIn className="h-5 w-5" />
                    Continue
                  </>
                )}
              </button>
            </form>

            {/* Demo users hint */}
            <div className="mt-8 pt-6 border-t border-[var(--color-border)]">
              <p className="text-center text-sm text-[var(--color-text-muted)] mb-3">
                Try with demo accounts
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setEmail("alice@company.com")}
                  className="flex-1 px-3 py-2 text-sm font-medium text-[var(--color-text-primary)] bg-[var(--color-bg-primary)] hover:bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-lg transition-colors"
                >
                  Alice
                </button>
                <button
                  type="button"
                  onClick={() => setEmail("bob@company.com")}
                  className="flex-1 px-3 py-2 text-sm font-medium text-[var(--color-text-primary)] bg-[var(--color-bg-primary)] hover:bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-lg transition-colors"
                >
                  Bob
                </button>
              </div>
            </div>
          </div>

          {/* Footer */}
          <p className="text-center text-xs text-[var(--color-text-muted)] mt-6">
            By continuing, you agree to our Terms and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
}
