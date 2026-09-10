// frontend/src/app/sitemap.ts
import { MetadataRoute } from 'next';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
const API_URL  = process.env.NEXT_PUBLIC_API_URL  || 'http://localhost:3001';

async function getAllJobSlugs(): Promise<{ slug: string; updatedAt?: string }[]> {
  try {
    const res = await fetch(`${API_URL}/api/jobs?limit=500`, { cache: 'no-store' });
    if (!res.ok) return [];
    const result = await res.json();
    const payload = result.data ?? result;
    const jobs: any[] = payload.jobs || [];
    return jobs.map((j) => ({ slug: j.slug, updatedAt: j.updatedAt }));
  } catch {
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const jobs = await getAllJobSlugs();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${BASE_URL}/`,                   lastModified: new Date(), changeFrequency: 'hourly',  priority: 1 },
    { url: `${BASE_URL}/jobs`,               lastModified: new Date(), changeFrequency: 'hourly',  priority: 0.9 },
    { url: `${BASE_URL}/latest-jobs`,        lastModified: new Date(), changeFrequency: 'hourly',  priority: 0.9 },
    { url: `${BASE_URL}/jobs/results`,       lastModified: new Date(), changeFrequency: 'daily',   priority: 0.8 },
    { url: `${BASE_URL}/jobs/admit-cards`,   lastModified: new Date(), changeFrequency: 'daily',   priority: 0.8 },
    { url: `${BASE_URL}/jobs/answer-keys`,   lastModified: new Date(), changeFrequency: 'daily',   priority: 0.8 },
    { url: `${BASE_URL}/admissions`,         lastModified: new Date(), changeFrequency: 'daily',   priority: 0.7 },
    { url: `${BASE_URL}/latest-forms`,       lastModified: new Date(), changeFrequency: 'daily',   priority: 0.7 },
    { url: `${BASE_URL}/about-us`,           lastModified: new Date(), changeFrequency: 'monthly', priority: 0.4 },
  ];

  const jobRoutes: MetadataRoute.Sitemap = jobs.map((job) => ({
    url: `${BASE_URL}/jobs/${job.slug}`,
    lastModified: job.updatedAt ? new Date(job.updatedAt) : new Date(),
    changeFrequency: 'weekly',
    priority: 0.7,
  }));

  return [...staticRoutes, ...jobRoutes];
}
