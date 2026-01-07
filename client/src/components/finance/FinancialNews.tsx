import { useState, useEffect, useCallback } from 'react';
import { RefreshCw, Newspaper, AlertCircle, ExternalLink } from 'lucide-react';
import { NewsCard } from './NewsCard';
import type { NewsArticle } from '@/lib/news-types';

interface FinancialNewsProps {
  compact?: boolean;
}

export function FinancialNews({ compact = false }: FinancialNewsProps) {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchNews = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      const response = await fetch(`/api/news/?limit=${compact ? 6 : 5}`);
      const result = await response.json();

      if (result.success && result.data) {
        setArticles(result.data.articles);
      } else {
        setError(result.error || 'Failed to load news');
      }
    } catch {
      setError('Network error loading news');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [compact]);

  useEffect(() => {
    fetchNews();
  }, [fetchNews]);

  const handleRefresh = () => {
    if (!refreshing) {
      fetchNews(true);
    }
  };

  // Compact mode for embedding in bento cards - 3x3 grid
  if (compact) {
    return (
      <div className="mt-2">
        {/* Refresh button row */}
        <div className="flex justify-end mb-3">
          <button
            onClick={handleRefresh}
            disabled={refreshing || loading}
            className="flex items-center gap-1.5 px-2 py-1 text-xs font-medium text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-primary)]/50 rounded-md transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="flex items-center gap-2 text-[var(--color-text-muted)] text-sm">
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Loading...</span>
            </div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-32">
            <div className="flex items-center gap-2 text-[var(--color-error)] text-sm">
              <AlertCircle className="w-4 h-4" />
              <span>{error}</span>
            </div>
          </div>
        ) : articles.length === 0 ? (
          <div className="flex items-center justify-center h-32">
            <p className="text-sm text-[var(--color-text-muted)]">No news available</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-4">
            {articles.slice(0, 6).map((article) => (
              <a
                key={article.id}
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block group"
              >
                <div className="p-3 rounded-xl bg-[var(--color-bg-primary)]/30 hover:bg-[var(--color-bg-primary)]/60 border border-[var(--color-border)]/30 hover:border-[var(--color-accent-primary)]/30 transition-all">
                  {article.imageUrl && (
                    <img
                      src={article.imageUrl}
                      alt=""
                      className="w-full h-20 object-cover rounded-lg mb-2"
                    />
                  )}
                  <p className="text-sm font-medium text-[var(--color-text-primary)] line-clamp-2 group-hover:text-[var(--color-accent-primary)] transition-colors leading-tight">
                    {article.title}
                  </p>
                  <p className="text-xs text-[var(--color-text-muted)] mt-1.5">
                    {article.source} · {new Date(article.publishedAt).toLocaleDateString()}
                  </p>
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Full mode (original)
  return (
    <div className="card-elevated card-glow">
      <div className="p-4 pb-3 flex items-center justify-between border-b border-[var(--color-border)]">
        <div className="flex items-center gap-2">
          <Newspaper className="w-5 h-5 text-[var(--color-accent-primary)]" />
          <h2 className="text-xl font-semibold">Latest Financial News</h2>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing || loading}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-[var(--color-muted-foreground)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-muted)]/50 rounded-lg transition-colors disabled:opacity-50"
        >
          <RefreshCw
            className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`}
          />
          Refresh
        </button>
      </div>

      <div className="p-4">
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="flex items-center gap-2 text-[var(--color-muted-foreground)]">
              <RefreshCw className="w-5 h-5 animate-spin" />
              <span>Loading news...</span>
            </div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-48">
            <div className="flex items-center gap-2 text-red-500">
              <AlertCircle className="w-5 h-5" />
              <span>{error}</span>
            </div>
          </div>
        ) : articles.length === 0 ? (
          <div className="flex items-center justify-center h-48 text-[var(--color-muted-foreground)]">
            No news articles available
          </div>
        ) : (
          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-thin">
            {articles.map((article) => (
              <NewsCard key={article.id} article={article} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
