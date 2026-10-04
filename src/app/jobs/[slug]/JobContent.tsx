import sanitizeHtml from 'sanitize-html';

export default function JobContent({ htmlContent }: { htmlContent: string }) {
  // Sanitize the HTML on the server using sanitize-html (safe for Vercel/Edge)
  const sanitizedHtml = sanitizeHtml(htmlContent, {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat([
      'img', 'h1', 'h2', 'h3', 'h4', 'span', 'style', 'div'
    ]),
    allowedAttributes: {
      ...sanitizeHtml.defaults.allowedAttributes,
      '*': ['style', 'class', 'id', 'align', 'valign', 'border', 'cellpadding', 'cellspacing', 'width', 'colspan', 'rowspan'],
      a: ['href', 'name', 'target', 'title', 'rel']
    }
  });

  return (
    <div className="external-job-content-wrapper w-full overflow-x-hidden">
      {/* Scoped CSS to isolate external styles and force responsive, structured tables */}
      <style>{`
        .external-job-content-wrapper .responsive-scroll-container {
          width: 100%;
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
        }
        .external-job-content table {
          width: 100% !important;
          max-width: 100% !important;
          border-collapse: collapse !important;
          border: 1px solid #e2e8f0 !important;
          margin-top: 1rem;
          margin-bottom: 1rem;
          background-color: #ffffff;
          box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.05);
          border-radius: 0.5rem;
          overflow: hidden;
        }
        .external-job-content td, 
        .external-job-content th {
          word-wrap: break-word;
          white-space: normal !important;
          border: 1px solid #e2e8f0 !important;
          padding: 10px 14px !important;
          vertical-align: middle;
          width: auto !important; /* Override hardcoded pixel widths from legacy HTML */
        }
        .external-job-content tr:nth-child(even) {
          background-color: #f8fafc;
        }
        .external-job-content tr:hover {
          background-color: #f1f5f9;
        }
        .external-job-content img {
          max-width: 100% !important;
          height: auto !important;
        }
        /* Fix H2/H1 typography inside tables so SarkariResult <h2> tags don't blow up cell heights */
        .external-job-content table h1,
        .external-job-content table h2,
        .external-job-content table h3,
        .external-job-content table h4 {
          font-size: 0.95rem !important;
          font-weight: 700 !important;
          margin: 0.2rem 0 !important;
          line-height: 1.35 !important;
        }
        /* Restore basic typography outside tables */
        .external-job-content > h1, 
        .external-job-content > h2, 
        .external-job-content > h3 {
          font-size: 1.25rem;
          font-weight: 700;
          margin-top: 1.25em;
          margin-bottom: 0.5em;
          color: #1e293b;
        }
        .external-job-content a {
          color: #2563eb;
          text-decoration: underline;
          font-weight: 500;
        }
        .external-job-content a:hover {
          color: #1d4ed8;
        }
        .external-job-content ul, .external-job-content ol {
          padding-left: 1.25rem;
          margin-top: 0.4rem;
          margin-bottom: 0.6rem;
        }
        .external-job-content ul { list-style-type: disc; }
        .external-job-content ol { list-style-type: decimal; }
        .external-job-content li {
          margin-bottom: 0.25rem;
        }
        /* Prevent giant unbroken links/text from stretching mobile layout */
        .external-job-content * {
          word-break: break-word;
        }
      `}</style>
      
      <div className="responsive-scroll-container">
        <div 
          className="external-job-content text-gray-800"
          dangerouslySetInnerHTML={{ __html: sanitizedHtml }} 
        />
      </div>
    </div>
  );
}
