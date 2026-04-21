import React from 'react';
import { AppShell } from '../../components/layout/AppShell';

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-[#070707] text-[#e6e4dc] font-sans selection:bg-[#FF4D00] selection:text-white py-24 px-6">
      <div className="max-w-4xl mx-auto bg-[#101010] border border-[#252525] rounded-xl p-10 md:p-16">
        <h1 className="text-3xl md:text-5xl font-bold text-white mb-8">Terms of Service</h1>
        <p className="text-[#848480] mb-8 font-mono text-sm">Last Updated: April 21, 2026</p>

        <div className="space-y-8 text-[#848480] leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-white mb-4">1. Acceptance of Terms</h2>
            <p>
              By accessing or using the Payd.ai service, you agree to be bound by these Terms of Service. Payd.ai is a communications workflow platform, not a debt collection agency. You are solely responsible for the communications sent through our platform.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4">2. Nature of Service</h2>
            <p>
              Payd.ai provides tools to assist businesses in managing accounts receivable communications. We do not guarantee the successful collection of any outstanding invoices. Our service acts as a drafting assistant and workflow automation tool.
            </p>
            <ul className="list-disc pl-6 mt-4 space-y-2">
              <li>The user remains the sender at all times.</li>
              <li>The user remains the decision-maker for all automated and semi-automated communications.</li>
              <li>Payd.ai does not provide legal advice or debt collection services.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4">3. Acceptable Use</h2>
            <p>
              You agree not to use Payd.ai to:
            </p>
            <ul className="list-disc pl-6 mt-4 space-y-2">
              <li>Send coercive, threatening, or legally inaccurate communications.</li>
              <li>Harass or abuse invoice recipients.</li>
              <li>Violate any applicable laws, including but not limited to the Fair Debt Collection Practices Act (FDCPA) or equivalent local regulations.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4">4. Account Suspension</h2>
            <p>
              We reserve the right to suspend or terminate accounts that exceed acceptable complaint thresholds (e.g., spam or abuse reports) or violate these terms. A complaint rate exceeding 0.5% will result in automatic suspension of sending capabilities.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4">5. Limitation of Liability</h2>
            <p>
              To the maximum extent permitted by law, Payd.ai shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues, whether incurred directly or indirectly.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
