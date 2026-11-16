import type { Metadata } from 'next';
import LegalPage, { ContactLine } from '@/components/LegalPage';
import { SITE, SITE_URL } from '@/lib/api';

export const metadata: Metadata = {
  title: 'DMCA / Content Removal',
  description: `How to ask ${SITE.name} to correct or remove content.`,
  alternates: { canonical: `${SITE_URL}/dmca` },
};

export default function DmcaPage() {
  return (
    <LegalPage
      title="DMCA / Content Removal"
      updated="16 November 2026"
      intro={`We respect the rights of creators and organisations. If you believe something on ${SITE.name} infringes your copyright or contains an error about you or your organisation, tell us and we will look into it promptly.`}
    >
      <section>
        <h2>How to send a request</h2>
        <p>Contact us <ContactLine /> and include:</p>
        <ul>
          <li>the web address (URL) of the page, and exactly which content is affected;</li>
          <li>who you are and, for copyright claims, the work you own or are authorised to act for, with a link or proof of ownership;</li>
          <li>your contact details so we can reply;</li>
          <li>a statement that you believe in good faith that the use is not authorised, and that the information in your request is accurate.</li>
        </ul>
      </section>

      <section>
        <h2>What happens next</h2>
        <p>
          We review each request. If it is valid we remove or correct the content. We may tell the person who published the content about the request. If you think content was removed by mistake, you can send us a counter-notice with the same details and a statement explaining why the removal was a mistake.
        </p>
      </section>

      <section>
        <h2>Official notices</h2>
        <p>
          Public government notifications are published for the benefit of the public. We summarise them in our own words and link to the official source. If you are an organisation and prefer that a post be changed, corrected or removed, please say so in your request.
        </p>
      </section>
    </LegalPage>
  );
}
