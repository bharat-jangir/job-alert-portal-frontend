import { englishOnly } from '@/i18n/english-only-metadata';
import type { Metadata } from 'next';
import LegalPage, { ContactLine } from '@/components/LegalPage';
import { SITE } from '@/lib/api';

const meta: Metadata = {
  title: 'Disclaimer',
  description: `${SITE.name} is an independent information site and is not a government website.`,
};

export default function DisclaimerPage() {
  return (
    <LegalPage title="Disclaimer" updated="16 November 2026">
      <section>
        <h2>We are not a government website</h2>
        <p>
          {SITE.name} is a privately run information website. It is <strong>not</strong> an official website of the Government of India, any state government, or any recruitment board, commission, university or department. We do not conduct recruitment, issue admit cards or declare results.
        </p>
      </section>

      <section>
        <h2>Where our information comes from</h2>
        <p>
          Posts are written from publicly available official notifications and announcements. Where possible we link to the official source so you can read the original.
        </p>
      </section>

      <section>
        <h2>Always verify before you act</h2>
        <ul>
          <li>Check every date, fee, vacancy number and eligibility rule on the <strong>official website or notification</strong> before applying or paying.</li>
          <li>Apply only through the official application link of the recruiting organisation.</li>
          <li>We cannot guarantee that information is complete, current or free of errors, and we accept no responsibility for decisions made or losses suffered because of it.</li>
        </ul>
      </section>

      <section>
        <h2>Beware of scams</h2>
        <p>
          Genuine government recruitment does not ask for money in exchange for a job. {SITE.name} never asks you for money, bank details or OTPs. If someone does so using our name, please tell us <ContactLine />.
        </p>
      </section>

      <section>
        <h2>External links and advertising</h2>
        <p>Our posts link to other websites and may show third-party advertisements. We do not control or endorse them and are not responsible for their content.</p>
      </section>

      <section>
        <h2>Corrections</h2>
        <p>Found a mistake? Tell us <ContactLine /> and we will correct it quickly.</p>
      </section>
    </LegalPage>
  );
}

export const generateMetadata = englishOnly('/disclaimer', meta);
