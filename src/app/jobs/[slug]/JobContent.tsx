import DOMPurify from 'isomorphic-dompurify';

export default function JobContent({ htmlContent }: { htmlContent: string }) {
  // Sanitize the HTML on the server
  // This prevents XSS attacks while allowing safe HTML tags and inline styles
  const sanitizedHtml = DOMPurify.sanitize(htmlContent, {
    ADD_ATTR: ['target'], // Allow target="_blank" for external links
  });

  return (
    <div className="external-job-content-wrapper w-full overflow-x-hidden">
      {/* Scoped CSS to isolate external styles and force responsive tables */}
      <style>{`
        .external-job-content-wrapper .responsive-scroll-container {
          width: 100%;
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
        }
        .external-job-content table {
          width: 100% !important;
          max-width: 100% !important;
          border-collapse: collapse;
          border: 1px solid #ccc;
        }
        .external-job-content td, 
        .external-job-content th {
          word-wrap: break-word;
          white-space: normal !important;
          border: 1px solid #ccc;
          padding: 8px;
        }
        .external-job-content img {
          max-width: 100% !important;
          height: auto !important;
        }
        /* Restore basic typography that Tailwind resets */
        .external-job-content h1, .external-job-content h2, 
        .external-job-content h3, .external-job-content h4 {
          font-weight: bold;
          margin-top: 1em;
          margin-bottom: 0.5em;
        }
        .external-job-content a {
          color: #2563eb;
          text-decoration: underline;
        }
        .external-job-content ul, .external-job-content ol {
          padding-left: 1.5rem;
          margin-bottom: 1rem;
        }
        .external-job-content ul { list-style-type: disc; }
        .external-job-content ol { list-style-type: decimal; }
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
