import type { Metadata } from 'next';
import LegalPage, { ContactLine } from '@/components/LegalPage';
import { SITE, SITE_URL } from '@/lib/api';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: `How ${SITE.name} collects, uses and protects information when you use the site.`,
  alternates: { canonical: `${SITE_URL}/privacy-policy` },
};

export default function PrivacyPolicyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      updated="16 November 2026"
      intro={`${SITE.name} ("we", "us") publishes government job notifications, results, admit cards and related updates. This policy explains what information we handle when you use the site and what we do with it.`}
    >
      <section>
        <h2>Information we collect</h2>
        <ul>
          <li><strong>Information you send us.</strong> If you use the contact form we receive your name, e-mail address, subject and message so that we can reply.</li>
          <li><strong>Technical logs.</strong> For security, abuse prevention and debugging our servers record the IP address, browser type, requested address and response status of some requests (for example failed requests and form submissions). These logs are deleted automatically after 14 days.</li>
          <li><strong>Cookies and similar technology.</strong> Reading the site does not require an account. We do not set tracking cookies ourselves. If we display advertising or use analytics, the providers of those services (for example Google) may use cookies to measure and personalise ads. You can control or delete cookies in your browser settings.</li>
        </ul>
      </section>

      <section>
        <h2>How we use information</h2>
        <ul>
          <li>to answer messages sent through the contact form;</li>
          <li>to keep the site secure, prevent abuse and fix problems;</li>
          <li>to understand which content is useful, in aggregate, so we can improve the site.</li>
        </ul>
        <p>We do not sell your personal information.</p>
      </section>

      <section>
        <h2>Advertising and third parties</h2>
        <p>
          The site may show advertisements served by third parties. These companies may collect information about your visits to this and other sites to show relevant ads. Their use of information is governed by their own privacy policies. Posts also link to official government and other external websites; we are not responsible for the privacy practices of those sites.
        </p>
      </section>

      <section>
        <h2>Retention</h2>
        <p>Contact messages are kept for as long as needed to handle your request and are deleted when no longer required. Technical logs are kept for 14 days.</p>
      </section>

      <section>
        <h2>Your choices</h2>
        <p>You may ask us to access, correct or delete the personal information you sent us {' '}<ContactLine />. We will respond as soon as we reasonably can.</p>
      </section>

      <section>
        <h2>Children</h2>
        <p>The site is intended for a general audience and is not directed at children under 13. We do not knowingly collect personal information from children.</p>
      </section>

      <section>
        <h2>Changes to this policy</h2>
        <p>We may update this policy from time to time. The date at the top shows when it last changed.</p>
      </section>

      <section>
        <h2>Contact</h2>
        <p>Questions about this policy? Reach us <ContactLine />.</p>
      </section>
    </LegalPage>
  );
}
