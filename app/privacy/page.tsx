import React from 'react';

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-[#070707] text-[#e6e4dc] font-sans selection:bg-[#FF4D00] selection:text-white py-24 px-6">
      <div className="max-w-4xl mx-auto bg-[#101010] border border-[#252525] rounded-xl p-10 md:p-16">
        <h1 className="text-3xl md:text-5xl font-bold text-white mb-8">Privacy Policy</h1>
        <p className="text-[#848480] mb-8 font-mono text-sm">Last Updated: April 21, 2026</p>

        <div className="space-y-8 text-[#848480] leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-white mb-4">1. Introduction</h2>
            <p>
              Payd.ai respects your privacy and is committed to protecting your personal data. This Privacy Policy describes how we collect, use, and share information when you use our services.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4">2. Role as Data Processor</h2>
            <p>
              In providing the Payd.ai service, we act as a Data Processor on behalf of our customers (the Data Controllers). We process third-party email data (such as replies from your invoice recipients) strictly for the purpose of providing the service, under the lawful basis of legitimate interest (GDPR Article 6(1)(f)) for accounts receivable management.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4">3. Data We Collect</h2>
            <ul className="list-disc pl-6 space-y-2 mt-4">
              <li><strong>Account Information:</strong> Name, email address, company details, and billing information.</li>
              <li><strong>Integration Data:</strong> Data from connected accounting platforms (e.g., Xero, QuickBooks) including invoice details and contact information.</li>
              <li><strong>Communications Data:</strong> Email contents and metadata processed through our platform to classify intent and extract promises.</li>
              <li><strong>Usage Data:</strong> Information about how you interact with our platform (e.g., via PostHog analytics).</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4">4. How We Use Your Data</h2>
            <p>We use the collected data to:</p>
            <ul className="list-disc pl-6 space-y-2 mt-4">
              <li>Provide, operate, and maintain our services.</li>
              <li>Improve our AI classification and drafting models (anonymized where appropriate).</li>
              <li>Monitor for abuse, spam, and platform security.</li>
              <li>Communicate with you regarding your account and service updates.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4">5. Data Retention & Deletion</h2>
            <p>
              We retain personal data only for as long as necessary to provide the services and fulfill the purposes outlined in this policy. Upon account termination, or upon request from a Data Controller, we will delete or anonymize personal data within the statutory timeframes.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4">6. Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy or our data practices, please contact us at privacy@payd.ai.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
