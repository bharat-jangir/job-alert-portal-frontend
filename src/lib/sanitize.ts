import sanitizeHtml from 'sanitize-html';

/**
 * Server-side sanitiser for short rich-text fields that arrive as HTML from the API (FAQ answers…).
 * Defence in depth: the backend already sanitises on write and on read.
 */
export function sanitizeRichHtml(html: string): string {
  return sanitizeHtml(html ?? '', {
    allowedTags: ['p', 'br', 'b', 'strong', 'i', 'em', 'u', 's', 'ul', 'ol', 'li', 'a', 'code', 'pre', 'blockquote', 'span'],
    allowedAttributes: { a: ['href', 'target', 'rel'] },
    allowedSchemes: ['http', 'https', 'mailto', 'tel'],
    transformTags: {
      a: (tagName, attribs) => ({
        tagName,
        attribs: { ...attribs, rel: 'noopener noreferrer nofollow', ...(/^https?:/i.test(attribs.href || '') ? { target: '_blank' } : {}) },
      }),
    },
  });
}
