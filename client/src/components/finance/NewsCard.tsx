import { ExternalLink } from 'lucide-react';
import type { NewsArticle } from '@/lib/news-types';

interface NewsCardProps {
  article: NewsArticle;
}

export function NewsCard({ article }: NewsCardProps) {
  const formattedDate = new Date(article.publishedAt).toLocaleDateString(
    'en-US',
    {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }
  );

  return (
    <div className="card-elevated card-glow min-w-[300px] max-w-[300px] flex flex-col h-full">
      {article.imageUrl && (
        <div className="h-32 overflow-hidden rounded-t-xl">
          <img
            src={article.imageUrl}
            alt=""
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        </div>
      )}

      <div className="p-4 flex flex-col flex-1">
        <div className="flex items-center gap-2 text-xs text-[var(--color-muted-foreground)] mb-2">
          <span className="font-medium text-[var(--color-accent-primary)]">
            {article.source}
          </span>
          <span>·</span>
          <span>{formattedDate}</span>
        </div>

        <h4 className="font-semibold text-sm leading-tight mb-2 line-clamp-2">
          {article.title}
        </h4>

        {article.description && (
          <p className="text-xs text-[var(--color-muted-foreground)] line-clamp-3 flex-1">
            {article.description}
          </p>
        )}

        <a
          href={article.url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-[var(--color-accent-primary)] hover:opacity-80 transition-opacity"
        >
          Read More
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </div>
  );
}
