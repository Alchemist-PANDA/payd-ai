'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Button } from '../components/ui/Button';

export default function LandingPage() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });

    observerRef.current = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    const animatedElements = document.querySelectorAll('.glass-card, .step-card, .stat-card, .feature-card');
    animatedElements.forEach((el, i) => {
      (el as HTMLElement).style.opacity = '0';
      (el as HTMLElement).style.transform = 'translateY(20px)';
      (el as HTMLElement).style.transition = `opacity 0.6s ease ${i % 3 * 100}ms, transform 0.6s ease ${i % 3 * 100}ms`;
      observerRef.current?.observe(el);
    });

    // Add CSS for visible state if not in globals
    const style = document.createElement('style');
    style.innerHTML = `
      .is-visible {
        opacity: 1 !important;
        transform: translateY(0) !important;
      }
    `;
    document.head.appendChild(style);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      observerRef.current?.disconnect();
    };
  }, []);

  return (
    <div className="bg-[var(--surface-bg)] min-h-screen">
      {/* NAVBAR */}
      <nav className={`navbar ${isScrolled ? 'navbar--scrolled' : ''}`}>
        <div className="navbar__inner">
          <Link className="navbar__logo" href="/">
            <div className="navbar__logo-mark">P</div>
            Payd<span style={{ color: 'var(--brand-primary)' }}>AI</span>
          </Link>

          <ul className="navbar__links">
            <li><a className="navbar__link" href="#features">Features</a></li>
            <li><a className="navbar__link" href="#how-it-works">How it works</a></li>
            <li><a className="navbar__link" href="#pricing">Pricing</a></li>
            <li><a className="navbar__link" href="#testimonials">Reviews</a></li>
          </ul>

          <div className="navbar__actions">
            <Link className="btn btn-ghost btn-sm" href="/login">Sign in</Link>
            <Link className="btn btn-primary btn-sm" href="/signup">Get started free →</Link>
            <button
              className="navbar__hamburger"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Menu"
            >
              <span style={{ transform: isMobileMenuOpen ? 'rotate(45deg) translate(5px, 5px)' : '' }}></span>
              <span style={{ opacity: isMobileMenuOpen ? 0 : 1 }}></span>
              <span style={{ transform: isMobileMenuOpen ? 'rotate(-45deg) translate(7px, -7px)' : '' }}></span>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile menu */}
      <div className={`navbar__mobile ${isMobileMenuOpen ? 'is-open' : ''}`}>
        <a className="navbar__link" href="#features" onClick={() => setIsMobileMenuOpen(false)}>Features</a>
        <a className="navbar__link" href="#how-it-works" onClick={() => setIsMobileMenuOpen(false)}>How it works</a>
        <a className="navbar__link" href="#pricing" onClick={() => setIsMobileMenuOpen(false)}>Pricing</a>
        <a className="navbar__link" href="#testimonials" onClick={() => setIsMobileMenuOpen(false)}>Reviews</a>
        <hr className="divider" />
        <Link className="btn btn-secondary w-full" href="/login">Sign in</Link>
        <Link className="btn btn-primary w-full" href="/signup">Get started free →</Link>
      </div>

      {/* HERO */}
      <section className="hero">
        <div className="hero__bg"></div>
        <div className="hero__grid"></div>
        <div className="hero__orb hero__orb--1"></div>
        <div className="hero__orb hero__orb--2"></div>
        <div className="hero__orb hero__orb--3"></div>

        <div className="container">
          <div className="hero__content">
            <div className="hero__eyebrow animate-fade-up">
              <span className="hero__eyebrow-dot"></span>
              AI-powered financial intelligence
            </div>

            <h1 className="text-hero hero__headline animate-fade-up delay-100">
              Payments so smart,<br />
              <em className="gradient-text">they feel like magic.</em>
            </h1>

            <p className="text-body-lg hero__subheadline animate-fade-up delay-200">
              Payd AI handles invoicing, collections, reconciliation, and insights —
              so you can focus on what you actually love doing.
            </p>

            <div className="hero__actions animate-fade-up delay-300">
              <Button variant="primary" size="lg">
                Start for free
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="ml-1">
                  <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </Button>
              <Button variant="secondary" size="lg">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="mr-2">
                  <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5"/>
                  <path d="M6.5 5.5l4 2.5-4 2.5V5.5z" fill="currentColor"/>
                </svg>
                Watch demo
              </Button>
            </div>

            <div className="hero__trust animate-fade-up delay-400">
              <span className="hero__trust-item">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M7 1l1.545 3.13L12 4.635l-2.5 2.436.59 3.44L7 8.885l-3.09 1.626.59-3.44L2 4.635l3.455-.505L7 1z" fill="#FF9F0A"/>
                </svg>
                4.9 / 5 rating
              </span>
              <span className="hero__trust-dot"></span>
              <span className="hero__trust-item">No credit card required</span>
              <span className="hero__trust-dot"></span>
              <span className="hero__trust-item">Free 14-day trial</span>
            </div>
          </div>

          <div className="hero__visual">
            <div className="hero__visual-frame animate-scale-in delay-500">
              <div className="hero__visual-bar">
                <span className="hero__visual-dot hero__visual-dot--red"></span>
                <span className="hero__visual-dot hero__visual-dot--yellow"></span>
                <span className="hero__visual-dot hero__visual-dot--green"></span>
                <span style={{ marginLeft: 'var(--space-3)', fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>paydai.app/dashboard</span>
              </div>
              <div className="hero__visual-content">
                <div style={{ width: '100%', display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '16px', padding: '8px' }}>
                  <div className="glass-card" style={{ padding: '20px', textAlign: 'center' }}>
                    <div className="text-label mb-2">Revenue</div>
                    <div className="text-title" style={{ fontWeight: 700 }}>$48,290</div>
                    <div className="badge badge-green mt-2">↑ 12.4%</div>
                  </div>
                  <div className="glass-card" style={{ padding: '20px', textAlign: 'center' }}>
                    <div className="text-label mb-2">Invoices</div>
                    <div className="text-title" style={{ fontWeight: 700 }}>142</div>
                    <div className="badge badge-blue mt-2">3 pending</div>
                  </div>
                  <div className="glass-card" style={{ padding: '20px', textAlign: 'center' }}>
                    <div className="text-label mb-2">AI Score</div>
                    <div className="text-title" style={{ fontWeight: 700, color: 'var(--brand-primary)' }}>98</div>
                    <div className="badge badge-green mt-2">Excellent</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STATS BAND */}
      <section className="stats section" style={{ paddingBlock: 0 }}>
        <div className="stats__grid">
          <div className="stats__item">
            <div className="stats__number">$2B+</div>
            <div className="stats__label">Processed monthly</div>
          </div>
          <div className="stats__item">
            <div className="stats__number">50K+</div>
            <div className="stats__label">Active businesses</div>
          </div>
          <div className="stats__item">
            <div className="stats__number">99.9%</div>
            <div className="stats__label">Uptime SLA</div>
          </div>
          <div className="stats__item">
            <div className="stats__number">4.9★</div>
            <div className="stats__label">Average rating</div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="features section" id="features">
        <div className="container">
          <div className="features__intro">
            <div className="badge badge-blue mb-3">Everything you need</div>
            <h2 className="text-headline mb-4">Built for how<br />modern businesses work</h2>
            <p className="text-body-lg">
              One platform. Every financial workflow. Powered by AI that actually understands your business.
            </p>
          </div>

          <div className="grid-3">
            {[
              { icon: '⚡', title: 'Instant Invoicing', desc: 'Generate professional invoices in seconds. AI fills in details, suggests line items, and sends automatically.', color: 'blue' },
              { icon: '🤖', title: 'AI Collections', desc: 'Smart follow-ups that feel human. Our AI knows the perfect tone and timing to recover payments.', color: 'green' },
              { icon: '📊', title: 'Predictive Analytics', desc: 'Know your cash flow before it happens. Get 30, 60, and 90-day forecasts powered by AI.', color: 'orange' },
              { icon: '🔒', title: 'Bank-Grade Security', desc: '256-bit encryption, SOC 2 Type II certified. Your financial data is protected at every layer.', color: 'purple' },
              { icon: '🔗', title: '1-Click Integrations', desc: 'Connect Stripe, QuickBooks, Xero, and 200+ tools instantly. Your data, everywhere you need it.', color: 'pink' },
              { icon: '🌍', title: 'Global Payments', desc: 'Accept payments in 135+ currencies. Auto-convert, auto-reconcile, and auto-report.', color: 'teal' },
            ].map((f, i) => (
              <div key={i} className="glass-card feature-card">
                <div className={`feature-card__icon feature-card__icon--${f.color}`}>{f.icon}</div>
                <div className="feature-card__title">{f.title}</div>
                <p className="feature-card__desc">{f.desc}</p>
                <a className="feature-card__link" href="#">Learn more →</a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="steps section" id="how-it-works" style={{ background: 'linear-gradient(180deg, var(--surface-bg) 0%, rgba(10,132,255,0.03) 100%)' }}>
        <div className="container">
          <div className="features__intro">
            <div className="badge badge-green mb-3">How it works</div>
            <h2 className="text-headline mb-4">Up and running<br />in under 5 minutes</h2>
            <p className="text-body-lg">No complex setup. No technical expertise. Just connect and go.</p>
          </div>

          <div className="steps__track">
            {[
              { n: '1', t: 'Connect your accounts', d: 'Link your bank, payment processor, and accounting tools. Payd AI syncs everything instantly.' },
              { n: '2', t: 'AI learns your business', d: 'Our AI analyzes your payment patterns to create a personalized financial intelligence layer.' },
              { n: '3', t: 'Automate everything', d: 'Invoices send themselves. Reminders go out at the perfect moment. Reconciliation runs overnight.' },
              { n: '4', t: 'Grow with confidence', d: 'Real-time dashboards, AI forecasts, and proactive alerts keep you ahead of every risk.' },
            ].map((s, i) => (
              <div key={i} className="glass-card step-card">
                <div className="step-card__number">{s.n}</div>
                <div className="step-card__body">
                  <div className="step-card__title">{s.t}</div>
                  <p className="step-card__desc">{s.d}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section className="pricing section" id="pricing">
        <div className="container">
          <div className="pricing__intro">
            <div className="badge badge-orange mb-3">Simple pricing</div>
            <h2 className="text-headline mb-4">Start free.<br />Scale as you grow.</h2>
            <p className="text-body-lg">No hidden fees. No surprises. Cancel anytime.</p>
          </div>

          <div className="grid-3" style={{ alignItems: 'start' }}>
            <div className="glass-card plan-card">
              <div className="plan-card__name">Starter</div>
              <div className="plan-card__desc">Perfect for freelancers & small teams.</div>
              <div className="plan-card__price"><sup>$</sup>0</div>
              <div className="plan-card__period">Free forever</div>
              <hr className="divider" style={{ marginBlock: 'var(--space-4)' }} />
              <ul className="plan-card__features">
                <li className="plan-card__feature"><span className="plan-card__feature-icon">✓</span> Up to 10 invoices/month</li>
                <li className="plan-card__feature"><span className="plan-card__feature-icon">✓</span> Basic AI insights</li>
                <li className="plan-card__feature"><span className="plan-card__feature-icon">✓</span> 2 integrations</li>
              </ul>
              <Button variant="secondary" className="w-full">Get started free</Button>
            </div>

            <div className="glass-card plan-card plan-card--featured">
              <div className="plan-card__badge">Most Popular</div>
              <div className="plan-card__name">Pro</div>
              <div className="plan-card__desc">For growing businesses that move fast.</div>
              <div className="plan-card__price"><sup>$</sup>49</div>
              <div className="plan-card__period">per month</div>
              <hr className="divider" style={{ marginBlock: 'var(--space-4)', background: 'rgba(255,255,255,0.16)' }} />
              <ul className="plan-card__features">
                <li className="plan-card__feature"><span className="plan-card__feature-icon">✓</span> Unlimited invoices</li>
                <li className="plan-card__feature"><span className="plan-card__feature-icon">✓</span> Full AI automation</li>
                <li className="plan-card__feature"><span className="plan-card__feature-icon">✓</span> Unlimited integrations</li>
                <li className="plan-card__feature"><span className="plan-card__feature-icon">✓</span> Cash flow forecasting</li>
              </ul>
              <button className="btn w-full" style={{ background: 'white', color: 'var(--brand-primary)', fontWeight: 600 }}>
                Start free trial
              </button>
            </div>

            <div className="glass-card plan-card">
              <div className="plan-card__name">Enterprise</div>
              <div className="plan-card__desc">Custom solutions for organizations.</div>
              <div className="plan-card__price" style={{ fontSize: '2rem' }}>Custom</div>
              <div className="plan-card__period">Talk to sales</div>
              <hr className="divider" style={{ marginBlock: 'var(--space-4)' }} />
              <ul className="plan-card__features">
                <li className="plan-card__feature"><span className="plan-card__feature-icon">✓</span> Everything in Pro</li>
                <li className="plan-card__feature"><span className="plan-card__feature-icon">✓</span> Dedicated AI model</li>
                <li className="plan-card__feature"><span className="plan-card__feature-icon">✓</span> White-label options</li>
                <li className="plan-card__feature"><span className="plan-card__feature-icon">✓</span> SLA guarantee</li>
              </ul>
              <Button variant="dark" className="w-full">Contact sales</Button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA BAND */}
      <section className="cta-band">
        <div className="container">
          <h2 className="text-headline mb-4" style={{ color: 'white' }}>Ready to get paid smarter?</h2>
          <p className="text-body-lg mb-7" style={{ color: 'rgba(255,255,255,0.8)', maxWidth: '480px', marginInline: 'auto' }}>
            Join 50,000+ businesses. Start your free 14-day trial — no credit card needed.
          </p>
          <div className="flex justify-center gap-3">
            <button className="btn btn-lg" style={{ background: 'white', color: 'var(--brand-primary)' }}>
              Start for free →
            </button>
            <button className="btn btn-lg" style={{ background: 'rgba(255,255,255,0.15)', color: 'white', border: '1px solid rgba(255,255,255,0.3)' }}>
              Book a demo
            </button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="footer section">
        <div className="container">
          <div className="footer__grid">
            <div>
              <Link className="navbar__logo mb-4" href="/" style={{ color: 'white' }}>
                <div className="navbar__logo-mark">P</div>
                PaydAI
              </Link>
              <p className="footer__brand-desc">
                The AI-powered financial platform that helps modern businesses get paid faster, smarter, and stress-free.
              </p>
            </div>
            <div>
              <div className="footer__col-title">Product</div>
              <ul className="footer__links">
                <li><a className="footer__link" href="#">Features</a></li>
                <li><a className="footer__link" href="#">Pricing</a></li>
                <li><a className="footer__link" href="#">Integrations</a></li>
              </ul>
            </div>
            <div>
              <div className="footer__col-title">Company</div>
              <ul className="footer__links">
                <li><a className="footer__link" href="#">About</a></li>
                <li><a className="footer__link" href="#">Blog</a></li>
                <li><a className="footer__link" href="#">Contact</a></li>
              </ul>
            </div>
            <div>
              <div className="footer__col-title">Legal</div>
              <ul className="footer__links">
                <li><a className="footer__link" href="#">Privacy</a></li>
                <li><a className="footer__link" href="#">Terms</a></li>
                <li><a className="footer__link" href="#">Security</a></li>
              </ul>
            </div>
          </div>
          <div className="footer__bottom">
            <p className="footer__copy">© 2026 PaydAI, Inc. All rights reserved.</p>
            <div className="footer__bottom-links">
              <a className="footer__bottom-link" href="#">Status</a>
              <a className="footer__bottom-link" href="#">API</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
