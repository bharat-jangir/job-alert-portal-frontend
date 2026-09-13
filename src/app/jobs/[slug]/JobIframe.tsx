'use client';

export default function JobIframe({ htmlContent }: { htmlContent: string }) {
  // Inject CSS to fix horizontal scrolling caused by print-specific margins
  const resetStyles = `
    <style>
      html, body {
        margin: 0 !important;
        padding: 0 !important;
        max-width: 100vw !important;
        overflow-x: hidden !important; /* hide overflow on body itself */
      }
      .responsive-wrapper {
        width: 100%;
        overflow-x: auto;
        -webkit-overflow-scrolling: touch;
      }
      table {
        width: 100%; /* let it expand as needed natively */
        border-collapse: collapse;
      }
      td, th {
        word-wrap: break-word;
      }
      img {
        max-width: 100% !important;
        height: auto !important;
      }
      /* Prevent giant unbroken links/text from stretching mobile */
      * {
        word-break: break-word;
      }
    </style>
  `;

  // Wrap the body content in a scrollable div
  let processedHtml = htmlContent;
  
  if (processedHtml.includes('<body>')) {
    processedHtml = processedHtml.replace('<body>', '<body><div class="responsive-wrapper">');
    processedHtml = processedHtml.replace('</body>', '</div></body>');
  } else {
    processedHtml = `<div class="responsive-wrapper">${processedHtml}</div>`;
  }

  // Inject CSS
  if (processedHtml.includes('</head>')) {
    processedHtml = processedHtml.replace('</head>', `${resetStyles}</head>`);
  } else {
    processedHtml = resetStyles + processedHtml;
  }

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
        sandbox="allow-same-origin allow-scripts allow-popups allow-popups-to-escape-sandbox"
      />
    </div>
  );
}
