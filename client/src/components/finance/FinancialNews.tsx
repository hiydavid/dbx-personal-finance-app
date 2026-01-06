import { useState, useEffect, useCallback } from 'react';
import { RefreshCw, Newspaper, AlertCircle } from 'lucide-react';
import { NewsCard } from './NewsCard';
import type { NewsArticle } from '@/lib/news-types';

export function FinancialNews() {
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
      const response = await fetch('/api/news/?limit=5');
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
  }, []);

  useEffect(() => {
    fetchNews();
  }, [fetchNews]);

  const handleRefresh = () => {
    if (!refreshing) {
      fetchNews(true);
    }
  };

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
