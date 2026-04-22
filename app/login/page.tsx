'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../src/lib/supabase/client';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (signInError) {
      setError(signInError.message);
      setLoading(false);
      return;
    }

    // Set dev cookie for middleware if needed
    document.cookie = "dev-session=true; path=/; SameSite=Lax";
    router.replace('/dashboard');
  };

  return (
    <div className="min-h-screen bg-[var(--bg-base)] flex flex-col md:flex-row items-stretch justify-stretch overflow-hidden">
      {/* Left Side: Brand & Social Proof (Hidden on Mobile) */}
      <div className="hidden md:flex flex-1 flex-col justify-between p-12 bg-gradient-to-br from-[var(--bg-surface)] to-[var(--bg-base)] border-r border-[var(--border-subtle)] relative overflow-hidden">
        {/* Animated Background Gradients */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
           <div className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] bg-[var(--brand-primary)]/5 blur-[120px] rounded-full animate-pulse" />
           <div className="absolute -bottom-[20%] -right-[10%] w-[60%] h-[60%] bg-[var(--brand-cta)]/5 blur-[120px] rounded-full animate-pulse" style={{ animationDelay: '2s' }} />
        </div>

        <div className="relative z-10">
          <Link href="/" className="flex items-center gap-3 font-bold text-2xl tracking-tighter">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--brand-primary)] to-[var(--brand-cta)] flex items-center justify-center text-black">
              P
            </div>
            <span>Payd<span className="text-[var(--brand-primary)]">AI</span></span>
          </Link>
        </div>

        <div className="relative z-10 max-w-lg space-y-6">
           <Badge type="category">Fintech Infrastructure</Badge>
           <h2 className="text-4xl lg:text-5xl font-bold tracking-tight text-[var(--text-primary)] leading-[1.1]">
             Intelligent AR management for <span className="text-[var(--brand-primary)]">modern finance teams.</span>
           </h2>
           <p className="text-[var(--text-secondary)] text-lg">
             Automate receivables, improve client reliability, and recover cashflow without lifting a finger.
           </p>

           <div className="grid grid-cols-2 gap-8 pt-8 border-t border-[var(--border-subtle)]">
              <div>
                 <div className="text-3xl font-mono font-bold text-[var(--text-primary)]">$2.4B+</div>
                 <div className="text-xs font-bold uppercase tracking-widest text-[var(--text-disabled)] mt-1">Processed</div>
              </div>
              <div>
                 <div className="text-3xl font-mono font-bold text-[var(--text-primary)]">94.2%</div>
                 <div className="text-xs font-bold uppercase tracking-widest text-[var(--text-disabled)] mt-1">Recovery Rate</div>
              </div>
           </div>
        </div>

        <div className="relative z-10 flex items-center gap-4 text-xs font-medium text-[var(--text-disabled)]">
           <span className="flex items-center gap-1.5">
             <span className="w-1.5 h-1.5 rounded-full bg-[var(--status-success)]" />
             SOC2 Type II Compliant
           </span>
           <span className="w-1 h-1 rounded-full bg-[var(--border-strong)]" />
           <span className="flex items-center gap-1.5">
             <span className="w-1.5 h-1.5 rounded-full bg-[var(--status-success)]" />
             GDPR Ready
           </span>
        </div>
      </div>

      {/* Right Side: Auth Form */}
      <div className="flex-1 flex flex-col justify-center p-8 md:p-16 lg:p-24 animate-fade-in relative">
        <div className="md:hidden absolute top-8 left-8">
          <div className="flex items-center gap-2 font-bold text-xl tracking-tighter">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--brand-primary)] to-[var(--brand-cta)] flex items-center justify-center text-black">
              P
            </div>
            <span>Payd<span className="text-[var(--brand-primary)]">AI</span></span>
          </div>
        </div>

        <div className="w-full max-w-sm mx-auto space-y-8">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-[var(--text-primary)] tracking-tight">Welcome back</h1>
            <p className="text-[var(--text-secondary)]">Enter your credentials to access your dashboard</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-4">
              <Input
                label="Corporate Email"
                type="email"
                placeholder="you@company.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                leftIcon={
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.206" />
                  </svg>
                }
              />
              <div className="space-y-1">
                <Input
                  label="Password"
                  type="password"
                  placeholder="••••••••"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  leftIcon={
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  }
                />
                <div className="flex justify-end">
                  <button type="button" className="text-xs font-bold text-[var(--brand-primary)] hover:underline">
                    Forgot password?
                  </button>
                </div>
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-[var(--status-error)]/10 border border-[var(--status-error)]/20 text-xs font-medium text-[var(--status-error)] flex items-center gap-2 animate-fade-in">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {error}
              </div>
            )}

            <Button
              type="submit"
              variant="brand-primary"
              size="lg"
              className="w-full"
              loading={loading}
            >
              Sign In to Payd AI
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-[var(--border-subtle)]"></span></div>
            <div className="relative flex justify-center text-[10px] font-bold uppercase tracking-widest"><span className="bg-[var(--bg-base)] px-4 text-[var(--text-disabled)]">Secure SSO</span></div>
          </div>

          <Button variant="ghost" className="w-full border border-[var(--border-default)] hover:bg-[var(--bg-overlay)]">
            <svg className="w-4 h-4 mr-3" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Sign in with Microsoft / Google
          </Button>

          <p className="text-center text-xs text-[var(--text-secondary)] font-medium">
            Don't have an account?{' '}
            <button className="text-[var(--brand-primary)] font-bold hover:underline transition-all">
              Request Early Access
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

// Helper Link component for root level
function Link({ href, children, className }: { href: string; children: React.ReactNode; className?: string }) {
  return <a href={href} className={className}>{children}</a>;
}
