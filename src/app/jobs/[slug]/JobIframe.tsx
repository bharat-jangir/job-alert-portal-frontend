'use client';

export default function JobIframe({ htmlContent }: { htmlContent: string }) {
  // Inject CSS to fix horizontal scrolling caused by print-specific margins
  const resetStyles = `
    <style>
      html, body {
        overflow-x: hidden !important;
        margin: 0 !important;
        padding: 0 !important;
        max-width: 100% !important;
        height: auto !important;
        min-height: 100% !important;
      }
      .header-banner {
        margin: 0 0 25px 0 !important; /* Reset the negative margins */
      }
      /* Ensure tables and large elements don't overflow */
      table {
        max-width: 100% !important;
      }
    </style>
  `;

  // Inject before closing head if exists, else just prepend
  const processedHtml = htmlContent.includes('</head>') 
    ? htmlContent.replace('</head>', `${resetStyles}</head>`)
    : resetStyles + htmlContent;

  return (
    <div className="w-full overflow-x-hidden">
      <iframe
        srcDoc={processedHtml}
        className="w-full border-none overflow-hidden"
        style={{ minHeight: '200px', transition: 'height 0.2s ease-in-out' }}
        scrolling="no"
        onLoad={(e) => {
          const iframe = e.target as HTMLIFrameElement;
          const updateHeight = () => {
            try {
              if (iframe.contentWindow) {
                const doc = iframe.contentWindow.document;
                const height = Math.max(
                  doc.body.scrollHeight,
                  doc.documentElement.scrollHeight,
                  doc.body.offsetHeight,
                  doc.documentElement.offsetHeight
                );
                // Add a small buffer (e.g. 20px) to prevent cutoff
                if (height) iframe.style.height = (height + 20) + 'px';
              }
            } catch (err) {}
          };

          // Initial update
          setTimeout(updateHeight, 100);

          // Watch for internal height changes
          try {
            if (iframe.contentWindow?.document.body) {
              const ro = new ResizeObserver(() => updateHeight());
              ro.observe(iframe.contentWindow.document.body);
            }
          } catch (err) {}
        }}
        sandbox="allow-same-origin allow-scripts"
      />
    </div>
  );
}
