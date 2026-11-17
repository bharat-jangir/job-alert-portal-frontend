import { Calendar, Building2, MapPin } from 'lucide-react';
import Link from '@/i18n/link';
import { formatDate, type Locale } from '@/i18n/config';
import type { TFunction } from '@/i18n/dictionary';

export interface PostRowData {
  _id?: string;
  title: string;
  slug: string;
  lastDate?: string;
  organization?: string;
  location?: string;
}

/** One line in a list of posts (category, tag and latest pages). */
export default function PostRow({ job, locale, t, isNew }: { job: PostRowData; locale: Locale; t: TFunction; isNew?: boolean }) {
  return (
    <Link href={`/jobs/${job.slug}`} className="flex items-start gap-3 px-4 py-3 hover:bg-blue-50 transition-colors group">
      <span className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0 mt-1.5 group-hover:bg-blue-700" />
      <div className="flex-1 min-w-0">
        <span className="text-blue-700 text-sm font-medium group-hover:underline leading-snug block">{job.title}</span>
        <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-0.5">
          {job.organization && <span className="text-xs text-gray-400 flex items-center gap-0.5"><Building2 className="h-3 w-3" />{job.organization}</span>}
          {job.location && <span className="text-xs text-gray-400 flex items-center gap-0.5"><MapPin className="h-3 w-3" />{job.location}</span>}
          {job.lastDate && (
            <span className="text-xs text-red-400 flex items-center gap-0.5">
              <Calendar className="h-3 w-3" />{t('common.lastShort', { date: formatDate(job.lastDate, locale) })}
            </span>
          )}
        </div>
      </div>
      {isNew && <span className="text-xs text-white bg-blue-500 px-2 py-0.5 rounded-full flex-shrink-0 mt-0.5">{t('common.new')}</span>}
    </Link>
  );
}
