import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getPosts } from '../api.js';
import PostCard from '../components/PostCard.jsx';
import Spinner from '../components/Spinner.jsx';

const PAGE_SIZE = 10;

export default function Home() {
  const [params, setParams] = useSearchParams();
  const search = params.get('search') || '';
  const author = params.get('author') || '';
  const page = parseInt(params.get('page') || '1', 10);

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState(search);

  useEffect(() => {
    setQuery(search);
  }, [search]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');
    getPosts({ skip: (page - 1) * PAGE_SIZE, limit: PAGE_SIZE, search, author })
      .then((data) => {
        if (!cancelled) setPosts(data);
      })
      .catch((e) => {
        if (!cancelled) setError(e.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [search, author, page]);

  const applyFilters = (nextSearch, nextAuthor) => {
    const p = {};
    if (nextSearch) p.search = nextSearch;
    if (nextAuthor) p.author = nextAuthor;
    setParams(p);
  };

  const onSearch = (e) => {
    e.preventDefault();
    applyFilters(query.trim(), author);
  };

  const setPage = (n) => {
    const p = {};
    if (search) p.search = search;
    if (author) p.author = author;
    if (n > 1) p.page = String(n);
    setParams(p);
  };

  return (
    <div>
      <section className="hero">
        <h1>Stories worth telling.</h1>
        <p className="hero-sub">
          A community blog built on FastAPI — read, write, and discuss.
        </p>
        <form className="search-bar" onSubmit={onSearch}>
          <input
            type="search"
            placeholder="Search articles by title…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search articles"
          />
          <button className="btn btn-primary" type="submit">
            Search
          </button>
        </form>
        {author && (
          <div className="filter-chip">
            Filtered by author: <strong>{author}</strong>
            <button
              className="chip-clear"
              onClick={() => applyFilters(search, '')}
              aria-label="Clear author filter"
            >
              ✕
            </button>
          </div>
        )}
      </section>

      {loading ? (
        <Spinner label="Loading articles…" />
      ) : error ? (
        <div className="alert alert-error">{error}</div>
      ) : posts.length === 0 ? (
        <div className="empty">
          <h3>No articles found</h3>
          <p className="muted">
            {search || author
              ? 'Try a different search or clear the filters.'
              : 'Be the first to publish something — hit “Write” above.'}
          </p>
        </div>
      ) : (
        <>
          <div className="post-grid">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
          <div className="pagination">
            <button
              className="btn btn-ghost"
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
            >
              ← Newer
            </button>
            <span className="muted page-num">Page {page}</span>
            <button
              className="btn btn-ghost"
              disabled={posts.length < PAGE_SIZE}
              onClick={() => setPage(page + 1)}
            >
              Older →
            </button>
          </div>
        </>
      )}
    </div>
  );
}
