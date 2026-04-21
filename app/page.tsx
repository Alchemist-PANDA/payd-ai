'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, CheckCircle2 } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#070707] text-[#e6e4dc] font-sans selection:bg-[#FF4D00] selection:text-white">
      {/* Header */}
      <header className="border-b border-[#252525] relative">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-[#FF4D00] font-black text-2xl tracking-tighter">Payd</span>
            <span className="font-bold text-2xl">.ai</span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/login" className="text-sm font-medium hover:text-white transition-colors">
              Log in
            </Link>
            <Link
              href="/login"
              className="text-sm font-bold bg-white text-black px-5 py-2.5 rounded-md hover:bg-gray-200 transition-colors"
            >
              Start Free Trial
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-24 px-6 relative overflow-hidden">
        {/* Abstract Background element */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-[#FF4D00] opacity-5 blur-[120px] rounded-full pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1A0A0A] border border-[#3A1010] text-[#FF4D00] text-xs font-mono tracking-widest uppercase mb-8">
            <span className="w-2 h-2 rounded-full bg-[#FF4D00] animate-pulse" />
            Built for agencies & service businesses
          </div>

          <h1 className="text-5xl md:text-7xl font-black text-white leading-[1.05] tracking-tight mb-8">
            Your clients owe you money.<br />
            <span className="text-[#FF4D00]">Payd.ai makes sure they pay it.</span>
          </h1>

          <p className="text-xl md:text-2xl text-[#848480] max-w-2xl mx-auto leading-relaxed font-light mb-12">
            The AR collection system that recovers cash, tracks promises, and builds a permanent record of which clients actually keep their word.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/login"
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#FF4D00] text-white px-8 py-4 rounded-md font-bold text-lg hover:bg-[#e64500] transition-colors"
            >
              Start Free Trial <ArrowRight className="w-5 h-5" />
            </Link>
            <p className="text-sm text-[#515150] font-mono mt-4 sm:mt-0 sm:ml-4">No credit card required. Setup in 10 mins.</p>
          </div>
        </div>
      </section>

      {/* Social Proof / Stats */}
      <section className="py-12 border-y border-[#252525] bg-[#101010]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 divide-x divide-[#252525]">
            <div className="text-center px-4">
              <p className="text-4xl font-black text-white mb-2">14<span className="text-[#848480] text-2xl font-light">d</span></p>
              <p className="text-sm text-[#515150] font-mono uppercase tracking-widest">Avg DSO Reduction</p>
            </div>
            <div className="text-center px-4">
              <p className="text-4xl font-black text-[#00A67E] mb-2">88<span className="text-[#848480] text-2xl font-light">%</span></p>
              <p className="text-sm text-[#515150] font-mono uppercase tracking-widest">Promises Kept</p>
            </div>
            <div className="text-center px-4">
              <p className="text-4xl font-black text-white mb-2">8<span className="text-[#848480] text-2xl font-light">hrs</span></p>
              <p className="text-sm text-[#515150] font-mono uppercase tracking-widest">Saved per week</p>
            </div>
            <div className="text-center px-4">
              <p className="text-4xl font-black text-white mb-2">$0</p>
              <p className="text-sm text-[#515150] font-mono uppercase tracking-widest">Collection Fees</p>
            </div>
          </div>
        </div>
      </section>

      {/* Core Features */}
      <section className="py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-20 max-w-2xl">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 tracking-tight">
              Stop acting like a bank.<br />
              Start collecting like a machine.
            </h2>
            <p className="text-lg text-[#848480]">
              Payd.ai isn't a dumb reminder tool. It's a workflow engine that reads replies, tracks commitments, and escalates intelligently.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-[#101010] border border-[#252525] rounded-xl p-8 hover:border-[#FF4D00] transition-colors group">
              <div className="w-12 h-12 bg-[#2a1200] rounded-lg flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-[#FF4D00]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-3 group-hover:text-[#FF4D00] transition-colors">Promise Tracker</h3>
              <p className="text-[#848480] leading-relaxed">
                When a client replies "I'll pay on Friday," the AI extracts the date and pauses the sequence. If they don't pay, it automatically resumes and escalates.
              </p>
            </div>

            <div className="bg-[#101010] border border-[#252525] rounded-xl p-8 hover:border-[#00A67E] transition-colors group">
              <div className="w-12 h-12 bg-[#061412] rounded-lg flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-[#00A67E]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-3 group-hover:text-[#00A67E] transition-colors">Client Reliability Score</h3>
              <p className="text-[#848480] leading-relaxed">
                Every client gets a running score from 0-100 based on their actual payment behavior and kept promises. Know exactly who needs a 50% deposit next time.
              </p>
            </div>

            <div className="bg-[#101010] border border-[#252525] rounded-xl p-8 hover:border-[#3A7FCC] transition-colors group">
              <div className="w-12 h-12 bg-[#080f1a] rounded-lg flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-[#3A7FCC]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-3 group-hover:text-[#3A7FCC] transition-colors">Real Mailbox Sending</h3>
              <p className="text-[#848480] leading-relaxed">
                Emails send from your actual Google or Outlook account. They appear in your Sent folder. Thread continuity is maintained. Deliverability is guaranteed.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-32 px-6 border-t border-[#252525] bg-[#0A0A0A]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 tracking-tight">Honest pricing. High ROI.</h2>
            <p className="text-[#848480] text-lg">If we reduce your DSO by 5 days, this pays for itself 10x over.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Growth Tier */}
            <div className="bg-[#101010] border border-[#FF4D00] rounded-2xl p-10 relative overflow-hidden">
              <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-[#FF4D00] to-[#D4920A]" />
              <div className="inline-block px-3 py-1 rounded-full bg-[#2a1200] text-[#FF4D00] text-xs font-bold uppercase tracking-wider mb-6">
                Primary ICP
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Studio / Growth</h3>
              <p className="text-[#848480] text-sm mb-6">The right tier for 8–30 person agencies.</p>

              <div className="mb-8">
                <span className="text-5xl font-black text-white">$249</span>
                <span className="text-[#515150] font-mono">/mo</span>
              </div>

              <ul className="space-y-4 mb-10">
                {['Unlimited active invoices', '3 user seats', 'Xero + QuickBooks sync', 'Multi-contact per invoice (Auto-CC)', 'All AI features + email drafting', 'Client Reliability Score + Timeline', 'Broken Promise Escalation alerts'].map((feature, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-[#00A67E] shrink-0" />
                    <span className="text-[#e6e4dc]">{feature}</span>
                  </li>
                ))}
              </ul>

              <Link href="/login" className="block w-full py-4 text-center bg-[#FF4D00] hover:bg-[#e64500] text-white font-bold rounded-lg transition-colors">
                Start Free Trial
              </Link>
            </div>

            {/* Agency Pro Tier */}
            <div className="bg-[#101010] border border-[#252525] rounded-2xl p-10 flex flex-col">
              <div className="inline-block px-3 py-1 rounded-full bg-[#171717] text-[#848480] text-xs font-bold uppercase tracking-wider mb-6 self-start">
                At Scale
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Agency Pro</h3>
              <p className="text-[#848480] text-sm mb-6">Multi-client ops & accounting firms.</p>

              <div className="mb-8">
                <span className="text-5xl font-black text-white">$549</span>
                <span className="text-[#515150] font-mono">/mo</span>
              </div>

              <ul className="space-y-4 mb-10 flex-grow">
                {['Unlimited invoices & clients', '10 user seats', 'All integrations + API access', 'White-label email branding', 'Quarterly CRS Reports', 'Sequence customization per client', 'SSO Support'].map((feature, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-[#848480] shrink-0" />
                    <span className="text-[#e6e4dc]">{feature}</span>
                  </li>
                ))}
              </ul>

              <Link href="/login" className="block w-full py-4 text-center bg-[#252525] hover:bg-[#303030] text-white font-bold rounded-lg transition-colors mt-auto">
                Contact Sales
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 border-t border-[#252525]">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-8">Stop chasing. Start collecting.</h2>
          <Link
            href="/login"
            className="inline-flex items-center justify-center gap-2 bg-white text-black px-10 py-5 rounded-md font-bold text-lg hover:bg-gray-200 transition-colors"
          >
            Create Your Account
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-[#252525] bg-[#070707]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <span className="text-[#FF4D00] font-black text-xl tracking-tighter">Payd</span>
            <span className="font-bold text-xl">.ai</span>
          </div>
          <div className="flex items-center gap-8 text-sm text-[#515150]">
            <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="mailto:support@payd.ai" className="hover:text-white transition-colors">Contact</Link>
          </div>
          <div className="text-sm text-[#515150] font-mono">
            &copy; {new Date().getFullYear()} Payd.ai. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
