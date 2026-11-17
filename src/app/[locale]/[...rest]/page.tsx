import { notFound } from 'next/navigation';

// Any address that matches no page lands here, so it gets the site's own 404 page (with header and footer)
export default function CatchAll() {
  notFound();
}
