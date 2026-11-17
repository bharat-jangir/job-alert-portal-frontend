import { englishOnly } from '@/i18n/english-only-metadata';
import type { Metadata } from 'next';
import LegalPage, { ContactLine } from '@/components/LegalPage';
import { SITE } from '@/lib/api';

const meta: Metadata = {
  title: 'Terms & Conditions',
  description: `The terms that apply when you use ${SITE.name}.`,
};

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms & Conditions"
      updated="16 November 2026"
      intro={`By using ${SITE.name} you agree to these terms. If you do not agree, please do not use the site.`}
    >
      <section>
        <h2>What this site is</h2>
        <p>
          {SITE.name} is an independent information website. We summarise public notifications published by government departments, recruitment boards, universities and other organisations. We are <strong>not</strong> a government body and are not affiliated with, endorsed by or acting for any of the organisations mentioned.
        </p>
      </section>

      <section>
        <h2>Accuracy of information</h2>
        <p>
          We work to keep posts accurate and up to date, but dates, vacancies, fees and eligibility can change or contain errors. The official notification is always the final authority. You are responsible for checking details on the official website before you apply, pay a fee or travel for an exam. See also our <a href="/disclaimer">Disclaimer</a>.
        </p>
      </section>

      <section>
        <h2>Acceptable use</h2>
        <ul>
          <li>Do not attempt to disrupt, overload or gain unauthorised access to the site or its systems.</li>
          <li>Do not use automated tools to copy the site&apos;s content at scale or to republish it as your own.</li>
          <li>Do not use the contact form to send spam, unlawful or abusive content.</li>
        </ul>
      </section>

      <section>
        <h2>Content and ownership</h2>
        <p>
          The way we present and organise information, and the text we write, belong to {SITE.name}. Official notices, logos and names belong to their respective owners. You may link to our pages. If you believe content on the site infringes your rights, please see our <a href="/dmca">DMCA / Content Removal</a> page.
        </p>
      </section>

      <section>
        <h2>Third-party links and advertising</h2>
        <p>Posts link to external websites and may display advertisements. We do not control those sites or advertisers and are not responsible for their content, products or practices.</p>
      </section>

      <section>
        <h2>No fees for jobs</h2>
        <p>We never charge for jobs, admit cards or results, and we do not accept payments for placing candidates. Be careful of anyone claiming otherwise in our name.</p>
      </section>

      <section>
        <h2>Limitation of liability</h2>
        <p>
          The site and its content are provided &quot;as is&quot;, without warranties of any kind. To the fullest extent permitted by law, {SITE.name} is not liable for any loss or damage arising from your use of the site or from relying on information on it, including missed deadlines or rejected applications.
        </p>
      </section>

      <section>
        <h2>Changes</h2>
        <p>We may change the site or these terms at any time. Continued use after a change means you accept the updated terms.</p>
      </section>

      <section>
        <h2>Governing law and contact</h2>
        <p>These terms are governed by the laws of India. Questions? Reach us <ContactLine />.</p>
      </section>
    </LegalPage>
  );
}

export const generateMetadata = englishOnly('/terms', meta);
