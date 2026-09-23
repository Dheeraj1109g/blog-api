import { Link } from 'react-router-dom';
import { formatDate, excerpt } from '../utils.js';

export default function PostCard({ post }) {
  return (
    <article className="post-card">
      <div className="post-card-top">
        <span className="byline">
          <span className="avatar avatar-sm">
            {post.author?.[0]?.toUpperCase() || '?'}
          </span>
          <Link to={`/?author=${encodeURIComponent(post.author)}`} className="author-link">
            {post.author}
          </Link>
        </span>
        <time className="muted">{formatDate(post.created_at)}</time>
      </div>
      <h2 className="post-card-title">
        <Link to={`/posts/${post.id}`}>{post.title}</Link>
      </h2>
      <p className="post-card-excerpt">{excerpt(post.content)}</p>
      <Link to={`/posts/${post.id}`} className="read-more">
        Read article →
      </Link>
    </article>
  );
}
