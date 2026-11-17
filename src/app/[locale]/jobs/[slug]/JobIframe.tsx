'use client';

import { useState, useRef, useEffect, useCallback } from 'react';

export default function JobIframe({ htmlContent }: { htmlContent: string }) {
  const [iframeHeight, setIframeHeight] = useState('200px');
  const iframeRef = useRef<HTMLIFrameElement>(null);

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

  const updateHeight = useCallback(() => {
    const iframe = iframeRef.current;
    if (!iframe || !iframe.contentWindow) return;

    try {
      const doc = iframe.contentWindow.document;
      const wrapper = doc.querySelector('.responsive-wrapper');
      const contentHeight = wrapper ? (wrapper as HTMLElement).offsetHeight : 0;
      
      // We can use scrollHeight for safety, but we don't mutate style directly to avoid React resets
      const calculatedHeight = Math.max(
        contentHeight,
        doc.body.scrollHeight,
        doc.documentElement.scrollHeight
      );

      if (calculatedHeight > 0) {
        setIframeHeight((calculatedHeight + 30) + 'px');
      }
    } catch (err) {}
  }, []);

  const handleIframeLoad = () => {
    updateHeight();
    
    // Fallback checks for slow-rendering content (images, fonts)
    setTimeout(updateHeight, 200);
    setTimeout(updateHeight, 1000);

    const iframe = iframeRef.current;
    if (iframe && iframe.contentWindow?.document) {
      try {
        const ro = new ResizeObserver(() => updateHeight());
        if (iframe.contentWindow.document.body) {
          ro.observe(iframe.contentWindow.document.body);
        }
        const wrapper = iframe.contentWindow.document.querySelector('.responsive-wrapper');
        if (wrapper) ro.observe(wrapper);
      } catch (err) {}
    }
  };

  return (
    <div className="w-full overflow-x-hidden">
      <iframe
        ref={iframeRef}
        srcDoc={processedHtml}
        className="w-full border-none overflow-hidden"
        style={{ height: iframeHeight, transition: 'height 0.2s ease-in-out' }}
        scrolling="no"
        onLoad={handleIframeLoad}
        sandbox="allow-same-origin allow-scripts allow-popups allow-popups-to-escape-sandbox"
      />
    </div>
  );
}
